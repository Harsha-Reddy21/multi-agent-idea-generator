import pytest
from pydantic import ValidationError
from data_service.serializers.template import (
    TemplateRequest,
    TemplateListItem,
    TemplateListResponse,
    TemplateResponse,
)


def test_template_request_valid():
    req = TemplateRequest(name="Temp1", content="Body")
    assert req.name == "Temp1"


def test_template_request_invalid():
    with pytest.raises(ValidationError):
        TemplateRequest(name="A", content="B")


def test_template_list_item_and_response():
    item = TemplateListItem(
        id=1, name="Temp", content="Content", created_by="u1", modified_by="u1"
    )
    resp = TemplateListResponse(templates=[item])
    assert len(resp.templates) == 1
    full = TemplateResponse(message="ok", template=item)
    assert full.message == "ok"
