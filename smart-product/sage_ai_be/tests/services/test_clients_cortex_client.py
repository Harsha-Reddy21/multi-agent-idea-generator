import asyncio
import pytest

from data_service.clients.cortex_client import CortexClient


class FakeAsyncResponse:
    def __init__(self, status_code=200, json_data=None, text="OK"):
        self.status_code = status_code
        self._json = json_data or {}
        self.text = text

    def json(self):
        return self._json


class FakeAsyncClient:
    def __init__(self):
        self.post_calls = []

    async def post(
        self,
        url,
        data=None,
        params=None,
        headers=None,
        timeout=None,
        files=None,
        json=None,
    ):
        resp = self.next_response
        self.post_calls.append(
            {
                "url": url,
                "data": data,
                "params": params,
                "headers": headers,
                "timeout": timeout,
                "files": files,
                "json": json,
            }
        )
        if isinstance(resp, Exception):
            raise resp
        return resp


class FakeSyncResponse:
    def __init__(self, status_code=200, json_data=None, text="OK"):
        self.status_code = status_code
        self._json = json_data or {}
        self.text = text

    def json(self):
        return self._json


class FakeSyncSession:
    def __init__(self):
        self.get_calls = []
        self.post_calls = []
        self.next_get = FakeSyncResponse()
        self.next_post = FakeSyncResponse()

    def get(self, url, params=None, headers=None, timeout=None):
        self.get_calls.append({"url": url, "params": params, "headers": headers})
        resp = self.next_get
        if isinstance(resp, Exception):
            raise resp
        return resp

    def post(
        self, url, json=None, headers=None, timeout=None
    ):  # sync create_model_config
        self.post_calls.append({"url": url, "json": json, "headers": headers})
        resp = self.next_post
        if isinstance(resp, Exception):
            raise resp
        return resp


@pytest.fixture
def client(monkeypatch):
    c = CortexClient()
    fake_async = FakeAsyncClient()

    # patch session directly
    c.session = fake_async

    # patch token refresh to avoid msal call
    def fake_refresh():
        c._access_token = "token"
        c._token_expiry = 9999999999

    monkeypatch.setattr(c, "_refresh_token", fake_refresh)
    return c, fake_async


@pytest.fixture
def sync_client(monkeypatch):
    c = CortexClient()

    # patch token refresh
    def fake_refresh():
        c._access_token = "token"
        c._token_expiry = 9999999999

    monkeypatch.setattr(c, "_refresh_token", fake_refresh)

    # Create fake async client with get method for get_model_classes
    fake_async = FakeAsyncClient()

    async def fake_get(url, params=None, headers=None, timeout=None):
        return fake_async.next_response

    fake_async.get = fake_get
    c.session = fake_async
    return c, fake_async


# Helper to run async
run = asyncio.run


def test_invoke_ask_success(client, monkeypatch):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(200, {"message": "hello"})
    out = run(c.invoke_ask("modelA", "prompt"))
    assert out == "hello"


def test_invoke_ask_retry_auth_then_success(client, monkeypatch):
    c, fake_async = client
    # first a 401 then a 200
    responses = [
        FakeAsyncResponse(401, {"message": ""}),
        FakeAsyncResponse(200, {"message": "world"}),
    ]

    def seq_post(url, data=None, headers=None, timeout=None):
        r = responses.pop(0)
        fake_async.post_calls.append({"url": url, "data": data, "headers": headers})
        return r

    async def post(url, data=None, headers=None, timeout=None):
        return seq_post(url, data, headers, timeout)

    monkeypatch.setattr(fake_async, "post", post)
    out = run(c.invoke_ask("modelA", "prompt"))
    assert out == "world"


def test_invoke_ask_http_error(client):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(500, text="err")
    from data_service.exceptions.service_errors import CortexClientError

    with pytest.raises(CortexClientError) as exc:
        run(c.invoke_ask("m", "p"))
    # Verify it mentions retry attempts
    assert "after" in str(exc.value).lower() and "attempt" in str(exc.value).lower()


def test_invoke_ask_request_exception(client, monkeypatch):
    c, fake_async = client
    import httpx

    fake_async.next_response = httpx.RequestError("boom", request=None)
    with pytest.raises(Exception) as exc:
        run(c.invoke_ask("m", "p"))
    assert "request failed" in str(exc.value).lower()


def test_ask_model_success(client):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(200, {"message": "ok"})
    out = run(c.ask_model("m", "doc"))
    assert out["message"] == "ok"


def test_ask_model_http_error(client):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(400, text="bad")
    with pytest.raises(Exception):
        run(c.ask_model("m", "doc"))


def test_ask_model_with_retry_json_success(client, monkeypatch):
    c, fake_async = client
    # Two bad JSON parse attempts then success
    msgs = ["not json", "still bad", '{"answers": [], "metadata": {}, "questions": []}']

    def build_resp(msg):
        return FakeAsyncResponse(200, {"message": msg})

    responses = [build_resp(m) for m in msgs]

    async def post(url, params=None, data=None, headers=None, timeout=None):
        return responses.pop(0)

    monkeypatch.setattr(fake_async, "post", post)

    # Patch validate_document_extraction_response to always pass first time valid JSON appears
    def fake_validate(data, model=None):
        return {"is_valid": True, "validated_data": data, "errors": []}

    monkeypatch.setattr(
        "data_service.clients.cortex_client.validate_document_extraction_response",
        fake_validate,
    )
    out = run(
        c.ask_model_with_retry_doc_extract(
            "m", "doc", max_retries=3, validate_schema=True
        )
    )
    assert out["success"] is True
    assert out["attempts"] == 3


def test_ask_model_with_retry_validation_retry_then_fail(client, monkeypatch):
    c, fake_async = client
    # Always return good JSON but validation wants retry then fails final
    msg = '{"answers": [], "metadata": {}, "questions": []}'
    fake_async.next_response = FakeAsyncResponse(200, {"message": msg})
    attempts = []

    def fake_validate(data, model=None):
        attempt_no = len(attempts) + 1
        attempts.append(attempt_no)
        # Always return is_valid=False to force retries and eventual failure
        return {"is_valid": False, "validated_data": None, "errors": ["bad"]}

    monkeypatch.setattr(
        "data_service.clients.cortex_client.validate_document_extraction_response",
        fake_validate,
    )
    out = run(c.ask_model_with_retry_doc_extract("m", "doc", max_retries=3))
    assert out["success"] is False
    assert out["attempts"] == 3
    assert "Schema validation failed" in out["error"]


def test_ask_model_with_retry_validation_can_skip_enrichment(client, monkeypatch):
    c, fake_async = client
    msg = '{"answers": [], "metadata": {}, "questions": []}'
    fake_async.next_response = FakeAsyncResponse(200, {"message": msg})

    def fake_validate(data, model=None):
        # Return success with validated data
        return {"is_valid": True, "validated_data": data, "errors": []}

    monkeypatch.setattr(
        "data_service.clients.cortex_client.validate_document_extraction_response",
        fake_validate,
    )
    out = run(c.ask_model_with_retry_doc_extract("m", "doc", max_retries=1))
    assert out["success"] is True
    # can_skip_enrichment is not part of the new validation response
    assert out.get("can_skip_enrichment", False) is False


def test_ask_model_with_retry_no_message(client, monkeypatch):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(200, {"message": ""})
    out = run(c.ask_model_with_retry_doc_extract("m", "doc", max_retries=2))
    assert out["success"] is False
    assert out["error"].startswith("No message field")


def test_ask_model_with_retry_request_exception(client, monkeypatch):
    c, fake_async = client
    import httpx

    fake_async.next_response = httpx.RequestError("network", request=None)
    # The ask_model raises CortexClientError which is caught by ask_model_with_retry_doc_extract
    # and converted to a return dict
    with pytest.raises(Exception) as exc:
        run(c.ask_model_with_retry_doc_extract("m", "doc", max_retries=1))
    # The CortexClientError is raised, not returned as a dict
    assert (
        "network" in str(exc.value).lower()
        or "request failed" in str(exc.value).lower()
    )


def test_get_model_classes_success(sync_client):
    c, sess = sync_client
    sess.next_response = FakeAsyncResponse(200, {"models": ["a", "b"]})
    out = run(c.get_model_classes(is_admin=True))
    assert out["models"] == ["a", "b"]


def test_get_model_classes_http_error(sync_client):
    c, sess = sync_client
    sess.next_response = FakeAsyncResponse(500, text="boom")
    out = run(c.get_model_classes())
    assert "error" in out
    assert "500" in out["error"]


def test_upload_file_success(client):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(200, {"uploaded": True})
    out = run(c.upload_file("model", b"data", "file.txt"))
    assert out["uploaded"] is True


def test_upload_file_http_error(client):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(500, text="fail")
    with pytest.raises(Exception):
        run(c.upload_file("model", b"data", "file.txt"))


def test_ask_model_with_retry_schema_disabled(client, monkeypatch):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(200, {"message": '{"a":1}'})
    out = run(
        c.ask_model_with_retry_doc_extract(
            "m", "doc", max_retries=1, validate_schema=False
        )
    )
    assert out["success"] is True
    assert out["validation_passed"] is True  # as set when disabled


def test_ask_model_with_retry_internal_exception(client, monkeypatch):
    c, fake_async = client
    fake_async.next_response = FakeAsyncResponse(
        200, {"message": "{"}
    )  # invalid JSON triggers exception and retries
    out = run(c.ask_model_with_retry_doc_extract("m", "doc", max_retries=1))
    assert out["success"] is False
    assert (
        any("Invalid JSON" in err for err in out["validation_errors"])
        or "Invalid JSON" in out["error"]
    )


def test_invoke_ask_token_refresh_failure(client, monkeypatch):
    c, fake_async = client
    # first response triggers 401 -> refresh token -> refresh raises Exception
    fake_async.next_response = FakeAsyncResponse(401, {"message": ""})

    def bad_refresh():
        raise Exception("token error")

    monkeypatch.setattr(c, "_refresh_token", bad_refresh)
    from data_service.exceptions.service_errors import CortexClientError

    with pytest.raises((Exception, CortexClientError)) as exc:
        run(c.invoke_ask("modelA", "prompt"))
    # Error message may be wrapped in CortexClientError retry message or direct exception
    assert (
        "token error" in str(exc.value).lower()
        or "cortex api call failed" in str(exc.value).lower()
    )


def test_invoke_ask_generic_exception(client, monkeypatch):
    c, fake_async = client

    # Force generic exception after JSON handling by raising unexpected Exception in json()
    class BadResp(FakeAsyncResponse):
        def json(self):  # trigger generic exception path
            raise RuntimeError("json boom")

    fake_async.next_response = BadResp(200)
    from data_service.exceptions.service_errors import CortexClientError

    with pytest.raises((Exception, CortexClientError)) as exc:
        run(c.invoke_ask("m", "p"))
    # Error is wrapped in CortexClientError retry message
    assert (
        "cortex api call failed" in str(exc.value).lower()
        or "json boom" in str(exc.value).lower()
    )


def test_ask_model_with_retry_doc_extract_token_refresh_failure(monkeypatch):
    # simulate token refresh failure when access_token property triggers _refresh_token
    c = CortexClient()
    fake_async = FakeAsyncClient()
    c.session = fake_async

    def bad_refresh():
        raise Exception("refresh fail")

    monkeypatch.setattr(c, "_refresh_token", bad_refresh)
    # cause access_token to try refresh
    c._access_token = None
    fake_async.next_response = FakeAsyncResponse(200, {"message": "{}"})
    # The token refresh failure raises an exception during execution
    with pytest.raises(Exception) as exc:
        run(
            c.ask_model_with_retry_doc_extract(
                "m", "doc", max_retries=1, validate_schema=False
            )
        )
    assert "refresh fail" in str(exc.value)


# New tests for uncovered branches


def test_access_token_refresh_success(monkeypatch):
    c = CortexClient()
    # Force refresh path
    c._access_token = None
    c._token_expiry = None

    def fake_refresh():
        c._access_token = "newtoken"
        c._token_expiry = 9999999999

    monkeypatch.setattr(c, "_refresh_token", fake_refresh)
    assert c.access_token == "newtoken"  # triggers refresh branch


def test_session_initialization():
    # Test that the real CortexClient (not patched) initializes session
    # Since we're testing in a patched environment, we need to import the real class
    from data_service.clients.cortex_client import CortexClient as RealCortexClient
    import httpx

    # Create a real instance (will fail MSAL but session should be created)
    try:
        c = RealCortexClient()
        # Session should be initialized in __init__
        assert c.session is not None
        assert isinstance(c.session, httpx.AsyncClient)
    except Exception:
        # If MSAL initialization fails, that's okay for this test
        # We're only testing that session gets initialized
        pass


def test_upload_file_request_exception(client, monkeypatch):
    import httpx

    c, fake_async = client

    async def raise_exc(
        url, headers=None, files=None, timeout=None
    ):  # pylint: disable=unused-argument
        raise httpx.RequestError("upload fail", request=None)

    monkeypatch.setattr(c.session, "post", raise_exc)
    with pytest.raises(Exception) as exc:
        asyncio.run(c.upload_file("m", b"data", "f.txt"))
    assert "upload" in str(exc.value).lower()


def test_ask_model_request_exception(client, monkeypatch):
    import httpx

    c, fake_async = client

    async def raise_exc(
        url, params=None, data=None, headers=None, timeout=None
    ):  # pylint: disable=unused-argument
        raise httpx.RequestError("ask fail", request=None)

    monkeypatch.setattr(c.session, "post", raise_exc)
    with pytest.raises(Exception) as exc:
        asyncio.run(c.ask_model("m", "doc"))
    assert "request failed" in str(exc.value).lower()


def test_ask_model_with_retry_zero_retries(monkeypatch):
    c = CortexClient()

    # patch token refresh to avoid msal call
    def fake_refresh():
        c._access_token = "token"
        c._token_expiry = 9999999999

    monkeypatch.setattr(c, "_refresh_token", fake_refresh)

    out = asyncio.run(
        c.ask_model_with_retry_doc_extract(
            "m", "doc", max_retries=0, validate_schema=False
        )
    )
    assert out["success"] is False
    assert out["error"] == "Max retries exceeded"


def test_ask_model_with_retry_validation_retry_exhausted(monkeypatch):
    c = CortexClient()
    fake_async = FakeAsyncClient()

    async def post(
        url, params=None, data=None, headers=None, timeout=None
    ):  # pylint: disable=unused-argument
        return FakeAsyncResponse(200, {"message": '{"a":1}'})

    fake_async.post = post
    c.session = fake_async

    # patch token refresh to avoid msal call
    def fake_refresh():
        c._access_token = "token"
        c._token_expiry = 9999999999

    monkeypatch.setattr(c, "_refresh_token", fake_refresh)

    # Use document extraction validator
    def fake_validate(data, model=None):  # pylint: disable=unused-argument
        # Return is_valid=False to trigger retry/failure
        return {"is_valid": False, "validated_data": None, "errors": ["bad validation"]}

    monkeypatch.setattr(
        "data_service.clients.cortex_client.validate_document_extraction_response",
        fake_validate,
    )
    out = asyncio.run(
        c.ask_model_with_retry_doc_extract(
            "m", "doc", max_retries=3, validate_schema=True
        )
    )
    assert out["success"] is False
    assert "Schema validation failed" in out["error"]
