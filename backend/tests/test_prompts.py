from app.services.llm import build_rag_prompt

def test_rag_prompt_marks_document_text_as_untrusted_and_requires_grounding() -> None:
    prompt = build_rag_prompt("What is the limit?", [("manual.pdf", 7, "50 degrees")])
    assert "untrusted data" in prompt
    assert "Do not invent facts" in prompt
    assert "[Source 1 | manual.pdf | page 7]" in prompt
