import { useCallback, useEffect, useState } from 'react'
import { Activity, ArrowDownToLine, ArrowUpRight, BookOpen, Check, ChevronRight, CircleHelp, FileText, Files, LoaderCircle, Plus, Search, Send, Settings2, Sparkles, X } from 'lucide-react'
import { api, type Answer, type DocumentRecord, type SearchHit } from './api'

type View = 'library' | 'ask' | 'search' | 'settings'
const statusLabel: Record<string,string> = { READY:'Ready', PROCESSING:'Indexing', UPLOADED:'Queued', FAILED:'Failed' }

export default function App() {
  const [view, setView] = useState<View>('library')
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [selected, setSelected] = useState<DocumentRecord | null>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [searchResults, setSearchResults] = useState<SearchHit[]>([])
  const [question, setQuestion] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const refresh = useCallback(async () => { try { setDocuments(await api.documents()) } catch (e) { setError(e instanceof Error ? e.message : 'API unavailable') } }, [])
  useEffect(() => { void refresh(); const timer = window.setInterval(() => void refresh(), 3500); return () => window.clearInterval(timer) }, [refresh])
  useEffect(() => { if (selected) { const current = documents.find(d => d.id === selected.id); if (current) setSelected(current) } }, [documents, selected?.id])

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true); setError(''); setNotice('')
    try { const doc = await api.upload(files[0]); setNotice(`${doc.filename} added to your library`); await refresh() }
    catch (e) { setError(e instanceof Error ? e.message : 'Upload failed') }
    finally { setBusy(false) }
  }
  async function ask() {
    if (!question.trim()) return
    setBusy(true); setError(''); setAnswer(null)
    try { setAnswer(await api.ask(question)) } catch (e) { setError(e instanceof Error ? e.message : 'Could not answer') }
    finally { setBusy(false) }
  }
  async function search() {
    if (!searchTerm.trim()) return
    setBusy(true); setError('')
    try { setSearchResults((await api.search(searchTerm)).results) } catch (e) { setError(e instanceof Error ? e.message : 'Search failed') }
    finally { setBusy(false) }
  }
  async function inspect(doc: DocumentRecord) { setSelected(doc); setView('library') }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BookOpen size={19}/></div><span>docintel<span className="brand-dot">.</span></span><span className="local-tag">LOCAL</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className={`nav-item ${view==='library'?'active':''}`} onClick={()=>{setView('library');setSelected(null)}}><Files size={17}/> Library <span className="nav-count">{documents.length}</span></button>
      <button className={`nav-item ${view==='ask'?'active':''}`} onClick={()=>setView('ask')}><Sparkles size={17}/> Ask documents</button>
      <button className={`nav-item ${view==='search'?'active':''}`} onClick={()=>setView('search')}><Search size={17}/> Semantic search</button>
      <div className="sidebar-bottom"><div className="privacy-card"><div className="privacy-icon"><Activity size={15}/></div><div><b>Private by design</b><span>Everything stays on this device.</span></div><Check size={15} className="privacy-check"/></div><button className={`nav-item ${view==='settings'?'active':''}`} onClick={()=>setView('settings')}><Settings2 size={17}/> Settings</button><div className="profile"><div className="avatar">D</div><div><b>Local workspace</b><span>Personal library</span></div><CircleHelp size={17} className="muted"/></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><b>{selected ? selected.filename : view==='library'?'Library':view==='ask'?'Ask documents':view==='search'?'Semantic search':'Settings'}</b></div><div className="top-actions"><span className="connection"><i/> Local system online</span><button className="icon-button" title="Help"><CircleHelp size={17}/></button></div></header>
      {(error||notice)&&<div className={`toast ${error?'is-error':''}`}>{error||notice}<button onClick={()=>{setError('');setNotice('')}}><X size={14}/></button></div>}
      {view==='library' && <>{selected ? <DocumentDetail document={selected} onBack={()=>setSelected(null)} onRetry={async()=>{await api.retry(selected.id);await refresh()}} onExtract={async()=>{setBusy(true);try{const data=await api.extract(selected.id);setNotice(JSON.stringify(data.result,null,2))}catch(e){setError(e instanceof Error?e.message:'Extraction failed')}finally{setBusy(false)}}}/> : <Library documents={documents} busy={busy} onUpload={upload} onSelect={inspect} onAsk={()=>setView('ask')}/>}</>}
      {view==='ask' && <section className="content ask-page"><div className="eyebrow"><Sparkles size={14}/> GROUNDED ANSWERS</div><h1>Ask your documents.</h1><p className="lede">Get clear answers with citations you can trace back to the source.</p><div className="ask-panel"><div className="ask-input-wrap"><textarea value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder="Ask a question across your library…"/><button className="send-button" disabled={busy||!question.trim()} onClick={()=>void ask()}>{busy?<LoaderCircle className="spin" size={17}/>:<Send size={17}/>}</button></div><div className="ask-hint"><span><span className="kbd">↵</span> to ask · <span className="kbd">⇧ ↵</span> for a new line</span><span>{documents.filter(d=>d.status==='READY').length} indexed documents</span></div></div>{answer&&<AnswerCard answer={answer} onSource={async id=>{try{await inspect(await api.document(id))}catch(e){setError(e instanceof Error?e.message:'Could not open source')}}}/>}<div className="suggestions"><span>TRY ASKING</span>{['What are the key operating limits?','Summarize the main points','Which model is described?'].map(s=><button key={s} onClick={()=>setQuestion(s)}>{s}<ArrowUpRight size={13}/></button>)}</div></section>}
      {view==='search' && <section className="content"><div className="eyebrow"><Search size={14}/> RETRIEVAL</div><h1>Find the right passage.</h1><p className="lede">Search by meaning across every indexed page in your library.</p><div className="search-box"><Search size={18}/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void search()} placeholder="Search your documents…"/><button onClick={()=>void search()} disabled={busy}>{busy?<LoaderCircle className="spin" size={16}/>:<span>Search</span>}</button></div>{searchResults.length>0&&<div className="result-list">{searchResults.map(hit=><article className="result-card" key={hit.chunk_id}><div className="result-meta"><span><FileText size={14}/>{hit.document}</span><span>Page {hit.page}</span><span className="score">{Math.round(hit.score*100)}% match</span></div><p>{hit.text}</p><button className="text-link" onClick={async()=>{try{await inspect(await api.document(hit.document_id))}catch(e){setError(e instanceof Error?e.message:'Could not open source')}}}>Open document <ArrowUpRight size={13}/></button></article>)}</div>}</section>}
      {view==='settings' && <section className="content"><div className="eyebrow"><Settings2 size={14}/> CONFIGURATION</div><h1>Your local setup.</h1><p className="lede">DocIntel runs on your machine, with no paid APIs or hosted services.</p><div className="settings-grid"><div className="setting-card"><span>EMBEDDING MODEL</span><b>all-MiniLM-L6-v2</b><p>384 dimensions · runs locally</p></div><div className="setting-card"><span>LANGUAGE MODEL</span><b>Ollama · llama3.2:3b</b><p>Change OLLAMA_MODEL in your .env</p></div><div className="setting-card"><span>VECTOR DATABASE</span><b>PostgreSQL + pgvector</b><p>Document index stored on this device</p></div><div className="setting-card"><span>CHUNKING</span><b>900 words · 120 overlap</b><p>Change CHUNK_SIZE and CHUNK_OVERLAP in .env</p></div></div><div className="notice-card"><Sparkles size={17}/><div><b>Keep your data yours.</b><p>Your documents and model data remain on local storage. This app is intended for a trusted, single-user machine.</p></div></div></section>}
    </main>
  </div>
}

function Library({documents,busy,onUpload,onSelect,onAsk}:{documents:DocumentRecord[];busy:boolean;onUpload:(files:FileList|null)=>void;onSelect:(doc:DocumentRecord)=>void;onAsk:()=>void}) {
  const ready=documents.filter(d=>d.status==='READY').length
  return <section className="content library-page"><div className="hero-row"><div><div className="eyebrow">YOUR PRIVATE KNOWLEDGE BASE</div><h1>Make your documents<br/><em>work for you.</em></h1><p className="lede">A thoughtful space to search, understand, and get more from the files you already have.</p><button className="primary-button" onClick={()=>document.getElementById('file-input')?.click()}>{busy?<LoaderCircle className="spin" size={16}/>:<Plus size={17}/>} Add documents <span className="button-shortcut">⌘ U</span></button><input id="file-input" hidden type="file" accept=".pdf,.txt,.md,.markdown" onChange={e=>{onUpload(e.target.files);e.target.value=''}}/></div><div className="hero-illustration"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="float-card card-back"><FileText size={20}/><span>Research.pdf</span><small>p. 08</small></div><div className="float-card card-front"><div className="doc-glyph"><FileText size={22}/></div><div><b>Source found</b><span>grounded · cited · local</span></div><Check size={16} className="glyph-check"/></div><div className="spark-dot dot-a"/><div className="spark-dot dot-b"/></div></div>
    <div className="stats-row"><div><b>{documents.length.toString().padStart(2,'0')}</b><span>Documents</span></div><div><b>{ready.toString().padStart(2,'0')}</b><span>Ready to explore</span></div><div className="stat-note"><i/> Your files stay on this device</div></div>
    <div className="section-heading"><div><h2>Your library</h2><span>{documents.length?`${documents.length} ${documents.length===1?'document':'documents'}`:'A fresh start'}</span></div><button className="subtle-button" onClick={()=>document.getElementById('file-input')?.click()}><Plus size={15}/> Add files</button></div>
    {documents.length===0 ? <div className="empty-state"><div className="empty-icon"><ArrowDownToLine size={21}/></div><h3>Your library starts here.</h3><p>Drop in a manual, report, or set of notes. We’ll index it locally so you can find answers in seconds.</p><button onClick={()=>document.getElementById('file-input')?.click()}>Choose a file <ArrowUpRight size={14}/></button><span>PDF, TXT, or Markdown · up to 20 MB</span></div> : <div className="document-list">{documents.map(doc=><button key={doc.id} className="document-row" onClick={()=>onSelect(doc)}><div className="file-icon"><FileText size={19}/></div><div className="file-info"><b>{doc.filename}</b><span>{new Date(doc.uploaded_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}{doc.page_count?` · ${doc.page_count} pages`:''}</span></div><span className={`status status-${doc.status.toLowerCase()}`}><i/>{statusLabel[doc.status]||doc.status}</span><ChevronRight size={16} className="row-arrow"/></button>)}</div>}
    <button className="bottom-tip" onClick={onAsk}><span className="tip-icon"><Sparkles size={15}/></span><span><b>Good questions start with a source.</b> Ask across your documents, with page-level citations built in.</span><span className="tip-link">Try it <ArrowUpRight size={13}/></span></button>
  </section>
}

function DocumentDetail({document,onBack,onRetry,onExtract}:{document:DocumentRecord;onBack:()=>void;onRetry:()=>void;onExtract:()=>void}) {
  const [chunks,setChunks]=useState<Array<{id:string;page_number:number;chunk_index:number;text:string}>>([])
  useEffect(()=>{if(document.status==='READY')void api.chunks(document.id).then(setChunks).catch(()=>setChunks([]))},[document.id,document.status])
  return <section className="content detail-page"><button className="back-button" onClick={onBack}>← Library</button><div className="detail-head"><div className="file-icon large"><FileText size={23}/></div><div><div className="eyebrow">DOCUMENT DETAILS</div><h1>{document.filename}</h1><p className="lede">Added {new Date(document.uploaded_at).toLocaleString()} · {document.page_count?`${document.page_count} pages`:'Page count pending'}</p></div><span className={`status status-${document.status.toLowerCase()}`}><i/>{statusLabel[document.status]||document.status}</span></div>{document.error_message&&<div className="error-card"><b>Processing needs attention</b><p>{document.error_message}</p><button className="subtle-button" onClick={onRetry}>Retry processing</button></div>}{document.status==='READY'&&<div className="detail-actions"><button className="primary-button" onClick={onExtract}><Sparkles size={15}/> Extract key fields</button></div>}<div className="section-heading"><div><h2>Extracted passages</h2><span>{chunks.length} page-aware chunks</span></div></div>{document.status!=='READY'?<div className="empty-state compact"><LoaderCircle className="spin" size={23}/><h3>Getting your document ready…</h3><p>Text extraction and local indexing run in the background.</p></div>:<div className="result-list">{chunks.map(chunk=><article className="result-card" key={chunk.id}><div className="result-meta"><span>Passage {chunk.chunk_index+1}</span><span>Page {chunk.page_number}</span></div><p>{chunk.text}</p></article>)}</div>}</section>
}

function AnswerCard({answer,onSource}:{answer:Answer;onSource:(id:string)=>void}) { return <article className="answer-card"><div className="answer-label"><Sparkles size={15}/> ANSWER <span>{(answer.response_time_ms/1000).toFixed(1)}s</span></div><p className="answer-text">{answer.answer}</p>{answer.sources.length>0&&<div className="citations"><div className="citation-title">SOURCES <span>{answer.sources.length} passages</span></div>{answer.sources.map((source,index)=><button className="citation" key={`${source.document_id}-${source.page}-${index}`} onClick={()=>onSource(source.document_id)}><span className="citation-number">{index+1}</span><span className="citation-body"><b>{source.document}</b><span>Page {source.page} · “{source.excerpt.slice(0,170)}{source.excerpt.length>170?'…':''}”</span></span><ArrowUpRight size={15}/></button>)}</div>}</article> }
