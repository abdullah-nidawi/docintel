const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export type DocumentRecord = {
  id: string; filename: string; content_type: string; status: string
  uploaded_at: string; processed_at: string | null; page_count: number | null
  error_message: string | null
}
export type SearchHit = {
  chunk_id: string; document_id: string; document: string; page: number
  score: number; text: string
}
export type Answer = { answer: string; response_time_ms: number; sources: Array<{
  document_id: string; document: string; page: number; score: number; excerpt: string
}> }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, init)
  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(data.detail || 'Request failed')
  }
  return response.json() as Promise<T>
}

export const api = {
  documents: () => request<DocumentRecord[]>('/documents'),
  document: (id: string) => request<DocumentRecord>(`/documents/${id}`),
  chunks: (id: string) => request<Array<{id:string;page_number:number;chunk_index:number;text:string}>>(`/documents/${id}/chunks`),
  upload: (file: File) => { const data = new FormData(); data.append('file', file); return request<DocumentRecord>('/documents', {method:'POST', body:data}) },
  search: (query: string) => request<{results:SearchHit[]}>('/search', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query,top_k:5})}),
  ask: (question: string) => request<Answer>('/ask', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question,top_k:5})}),
  extract: (id: string) => request<{result:Record<string,unknown>}>(`/documents/${id}/extract`, {method:'POST'}),
  retry: (id: string) => request<DocumentRecord>(`/documents/${id}/retry`, {method:'POST'}),
}
