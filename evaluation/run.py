"""Measure retrieval recall, citation page accuracy, and API latency."""
import argparse
import json
import statistics
import time
from pathlib import Path

import httpx

def evaluate(api: str, dataset: Path, top_k: int) -> dict[str, float | int]:
    examples = [json.loads(line) for line in dataset.read_text(encoding="utf-8").splitlines() if line.strip()]
    if not examples:
        raise ValueError("The evaluation dataset is empty.")
    recalls: list[float] = []
    citation_accuracy: list[float] = []
    latency_ms: list[float] = []
    with httpx.Client(base_url=api, timeout=240) as client:
        for item in examples:
            started = time.perf_counter()
            result = client.post("/search", json={"query": item["question"], "top_k": top_k})
            result.raise_for_status()
            hits = result.json()["results"]
            latency_ms.append((time.perf_counter() - started) * 1000)
            expected_document = item["expected_document"].casefold()
            expected_page = int(item["expected_page"])
            found = [hit for hit in hits if hit["document"].casefold() == expected_document]
            recalls.append(float(bool(found)))
            citation_accuracy.append(float(any(hit["page"] == expected_page for hit in found)))
    return {"questions": len(examples), "recall_at_k": statistics.mean(recalls),
            "citation_page_accuracy": statistics.mean(citation_accuracy),
            "average_latency_ms": statistics.mean(latency_ms), "top_k": top_k}

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", default="http://localhost:8000")
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()
    print(json.dumps(evaluate(args.api, args.dataset, args.top_k), indent=2))

if __name__ == "__main__":
    main()
