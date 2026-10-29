# Security notes

DocIntel is designed for a trusted, single-user machine. It is not an authenticated multi-user service. Keep API and database ports on localhost or a trusted network.

## File handling

- Only PDF, TXT, and Markdown extensions are accepted. PDFs must start with the PDF signature; text must be UTF-8.
- Uploads are capped at `MAX_UPLOAD_BYTES`, hashed with SHA-256 for duplicate detection, and saved under a generated UUID directory. The submitted filename never becomes a path.
- There is no antivirus scanner. Do not upload files from untrusted sources if your threat model requires malware screening.

## AI handling

- Document passages are treated as untrusted content in prompts. The model is told to ignore instructions inside documents and to abstain when evidence is missing.
- Retrieved passages are returned as citations even if model-written citation markers are incorrect; consumers should rely on the explicit `sources` array as the traceable retrieval record.
- Prompt injection and hallucination cannot be completely prevented. Review extracted values and important answers against the source.
- Ollama and embeddings run locally. Initial model downloads require an internet connection; runtime inference can remain local.

## Operations

- `.env` is ignored by Git. Change the development database password before exposing services beyond a laptop.
- Errors from document processing are recorded for local investigation. API model failures return a generic message; raw errors are not sent to the browser.
- No OCR is included, so scanned image-only PDFs fail with an actionable processing error.
