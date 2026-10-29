import pytest
from pydantic import ValidationError

from app.schemas import AskRequest, SearchRequest

def test_search_limits_are_validated() -> None:
    assert SearchRequest(query="temperature", top_k=5).top_k == 5
    with pytest.raises(ValidationError):
        SearchRequest(query="x", top_k=50)

def test_question_has_reasonable_length_limit() -> None:
    with pytest.raises(ValidationError):
        AskRequest(question="x" * 2001)
