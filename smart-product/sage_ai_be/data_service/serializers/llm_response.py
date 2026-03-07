"""
Pydantic models for LLM response validation
Ensures data integrity before metadata enrichment and form mapping
"""

from typing import Dict, Any

from pydantic import Field, ConfigDict, validator
from data_service.serializers.base import BaseSerializer


class AnswerObject(BaseSerializer):
    """
    Single answer object from LLM extraction

    This model ensures that each answer has the required fields
    for metadata enrichment (file, page) to prevent .get() failures
    """

    answer: str = Field(..., description="The extracted answer text")
    file: str = Field(..., description="Source filename (required for enrichment)")
    page: int = Field(..., description="Page number (required for enrichment)")

    @validator("answer")
    def answer_not_empty(cls, v):  # pylint: disable=no-self-argument
        """Ensure answer is not empty string."""
        if not v or not v.strip():
            raise ValueError("Answer cannot be empty")
        return v.strip()

    @validator("file")
    def file_not_empty(cls, v):  # pylint: disable=no-self-argument
        """Ensure file is not empty string."""
        if not v or not v.strip():
            raise ValueError("File name cannot be empty")
        return v.strip()

    @validator("page", pre=True)
    def coerce_page_to_int(cls, v):  # pylint: disable=no-self-argument
        """Convert string page numbers to int if possible."""
        if isinstance(v, str):
            if not v.isdigit():
                raise ValueError(f"Page must be a number, got: {v}")
            return int(v)
        if isinstance(v, int):
            if v < 1:
                raise ValueError(f"Page must be >= 1, got: {v}")
            return v
        raise ValueError(f"Page must be int or numeric string, got: {type(v)}")


class LLMExtractionResponse(BaseSerializer):
    """
    Overall LLM response structure validation.

    Validates that the response contains question IDs as keys and lists of
    AnswerObjects as values.
    """

    model_config = ConfigDict(
        extra="allow",  # Allow dynamic question IDs - INTENTIONAL
    )

    def validate_structure(self) -> Dict[str, Any]:
        """
        Validate that all values are lists of AnswerObjects.

        Returns:
            Dict[str, Any]: Dict with keys is_valid (bool), errors (List[str]) and
            validated_data (Dict[str, Any] | None).
        """
        errors = []
        validated_data = {}

        for question_id, answers in self.dict().items():
            # Skip internal fields
            if question_id.startswith("_"):
                continue

            # Validate question ID format (should contain hyphen)
            if "-" not in question_id:
                errors.append(
                    f"Invalid question ID format: {question_id} (expected format: PREFIX-QX)"
                )
                continue

            # Validate answers is a list
            if not isinstance(answers, list):
                errors.append(
                    f"{question_id}: Expected list of answers, got {type(answers)}"
                )
                continue

            # Validate each answer object
            validated_answers = []
            for idx, answer_data in enumerate(answers):
                try:
                    if not isinstance(answer_data, dict):
                        errors.append(
                            f"{question_id}[{idx}]: Expected dict, got {type(answer_data)}"
                        )
                        continue

                    # Validate answer object structure
                    validated_answer = AnswerObject(**answer_data)
                    validated_answers.append(validated_answer.dict())

                except ValueError as e:  # Narrow exception
                    errors.append(f"{question_id}[{idx}]: {str(e)}")

            validated_data[question_id] = validated_answers

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "validated_data": validated_data if len(errors) == 0 else None,
        }


def validate_llm_response(response_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate LLM response structure and answer objects.

    Args:
        response_json (Dict[str, Any]): Raw JSON from LLM.

    Returns:
        Dict[str, Any]: A structured validation result containing overall_structure_valid,
        answer_objects_valid, validation_errors, validated_data, should_retry, and
        can_proceed_without_enrichment flags.
    """
    result = {
        "overall_structure_valid": False,
        "answer_objects_valid": False,
        "validation_errors": [],
        "validated_data": None,
        "should_retry": False,
        "can_proceed_without_enrichment": False,
    }

    # Check if response is a dict
    if not isinstance(response_json, dict):
        result["validation_errors"].append(
            f"Response must be a dict, got {type(response_json)}"
        )
        result["should_retry"] = True
        return result

    # Check if response is empty
    if not response_json:
        result["validation_errors"].append("Response is empty")
        result["should_retry"] = True
        return result

    # Overall structure validation
    try:
        llm_response = LLMExtractionResponse(**response_json)
        validation = llm_response.validate_structure()

        if validation["is_valid"]:
            result["overall_structure_valid"] = True
            result["answer_objects_valid"] = True
            result["validated_data"] = validation["validated_data"]
        else:
            result["validation_errors"] = validation["errors"]

            # Determine if we should retry or can proceed
            # If overall structure is wrong (no valid question IDs), must retry
            if not validation["validated_data"]:
                result["should_retry"] = True
            else:
                # Some answers are valid, can proceed without enrichment
                result["answer_objects_valid"] = False
                result["should_retry"] = True  # But should retry first
                result["can_proceed_without_enrichment"] = True

    except ValueError as e:  # Narrow exception
        result["validation_errors"].append(
            f"Overall structure validation failed: {str(e)}"
        )
        result["should_retry"] = True

    return result
