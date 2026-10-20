"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { WorkshopSession } from "@/lib/types";
import { parseWorkshopBackup } from "@/lib/backup";
import { suggestConcerns } from "@/lib/session";
import { captureWordCount, documentSections, recoverConcernText } from "@/lib/document-sections";

export function CaptureStage({ session, onChange, onContinue, onLoadSample, onRestore, variant = "standard", saved }: {
  session: WorkshopSession; onChange: (patch: Partial<WorkshopSession>) => void;
  onContinue: () => void; onLoadSample: () => void; onRestore: (session:WorkshopSession) => void; saved: boolean; variant?: "standard" | "cornell";
}) {
  const [activeSection, setActiveSection] = useState(0);
  const [readAll, setReadAll] = useState(false);
  const [addingConcern, setAddingConcern] = useState(false);
  const [editing, setEditing] = useState(!session.rawCapture.trim());
  const [selection, setSelection] = useState("");
  const [newConcern, setNewConcern] = useState("");
  const [editingConcern, setEditingConcern] = useState<string|null>(null);
  const [concernDraft, setConcernDraft] = useState("");
  const [removed, setRemoved] = useState<{text:string; index:number} | null>(null);
  const [notice, setNotice] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const sections = useMemo(() => documentSections(session.rawCapture), [session.rawCapture]);
  const suggestions = suggestConcerns(session.rawCapture).filter(c => !session.concerns.includes(c) && !session.deferredConcerns.includes(c) && !(session.resolvedConcerns??[]).includes(c));
  const words = captureWordCount(session.rawCapture);
  const cornell = variant === "cornell";
  const current = sections[Math.min(activeSection, Math.max(0,sections.length-1))];
  const reviewed = session.reviewedSections ?? [];
  const unlinkedCues = Object.entries(session.cornellSectionCues??{}).filter(([id])=>!sections.some(section=>section.id===id));
  function chooseSection(index:number){setActiveSection(index);setReadAll(false);}
  function markReviewed(){if(!current)return;onChange({reviewedSections:Array.from(new Set([...reviewed,current.id]))});if(activeSection<sections.length-1)setActiveSection(activeSection+1);}
  function addConcern(text: string) {
    if (!text.trim() || session.concerns.includes(text.trim())) return;
    onChange({ concerns: [...session.concerns, text.trim()], resolvedConcerns:session.resolvedConcerns?.filter(c=>c!==text.trim()), removedConcerns:session.removedConcerns?.filter(c=>c!==text.trim()) });
    setNewConcern(""); setSelection(""); setNotice("Concern added to open questions. Your source notes are unchanged.");
  }
  function removeConcern(text: string) {
    setRemoved({text,index:session.concerns.indexOf(text)});
    onChange({ concerns: session.concerns.filter(c => c !== text), removedConcerns:[...(session.removedConcerns??[]),text] });
    setNotice("Concern removed from the open list. Source notes are unchanged.");
  }
  function undoRemoval() {
    if (!removed) return;
    const next = [...session.concerns]; next.splice(removed.index,0,removed.text);
    onChange({concerns:Array.from(new Set(next)),removedConcerns:session.removedConcerns?.filter(c=>c!==removed.text)}); setRemoved(null); setNotice("Concern restored.");
  }
  function selectText() {
    const el=textarea.current;
    if(el) setSelection(el.value.slice(el.selectionStart,el.selectionEnd).trim());
  }
  function exportCapture() {
    const blob=new Blob([JSON.stringify(session,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");a.href=url;a.download="workshop-backup.json";a.click();URL.revokeObjectURL(url);
  }
  async function importCapture(file?: File) {
    if(!file)return;
    try {
      const imported=parseWorkshopBackup(JSON.parse(await file.text()));
      if(!imported)throw new Error("Invalid workshop backup");
      if(session.rawCapture.trim() && !window.confirm("Replace this draft with the imported workshop? Download a backup first if you want to keep both."))return;
      onRestore(imported);
      setEditing(false);setNotice("Capture imported. All source text is preserved.");
    }catch{setNotice("Could not import this file. Choose a workshop JSON backup.");}
    if(fileInput.current)fileInput.current.value="";
  }
  return <div className="capture-workspace">
    <header className="capture-heading">
      <div><p className="nt-label">Step 01 · Capture</p><h2>Shape the starting point.</h2><p>Collect the intent. Keep the questions visible. You’ll make decisions in Clarify.</p></div>
      <span className="save-indicator"><span/> {saved?"Saved in this browser":"Not saved yet · Download backup to keep a copy"}</span>
    </header>
    <section className="workshop-title-panel" aria-labelledby="workshop-title-label">
      <label id="workshop-title-label" htmlFor="workshop-title">Workshop title <span>Editable</span></label>
      <input id="workshop-title" value={session.title} onChange={e=>onChange({title:e.target.value})} placeholder="Give this workshop a name" aria-describedby="title-help" />
      <p id="title-help">Click the field to rename this workshop. Changes save automatically.</p>
    </section>
    <div className="capture-toolbar">
      <div className="view-toggle" role="group" aria-label="Capture view"><button type="button" aria-pressed={!editing} onClick={()=>setEditing(false)}>Read document</button><button type="button" aria-pressed={editing} onClick={()=>setEditing(true)}>Edit source notes</button></div>
      <div className="capture-tools"><button type="button" onClick={()=>document.getElementById("concerns-title")?.scrollIntoView({block:"start"})}>Review {session.concerns.length} open concerns</button><span>{words.toLocaleString()} words · {sections.length} sections</span><button type="button" onClick={exportCapture}>Download backup</button><button type="button" onClick={()=>fileInput.current?.click()}>Import</button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={e=>void importCapture(e.target.files?.[0])}/></div>
    </div>
    <div className={cornell?"capture-grid cornell-grid":"capture-grid"}>
      <aside className="document-outline" aria-label={cornell?"Cornell section navigator":"Document outline"}>
        <p className="nt-label">{cornell?"Section navigator":"In this capture"}</p>
        {cornell && <div className="cornell-active-cue"><p className="nt-label">Cue · Current section</p><strong>{current?.title??"Starting intent"}</strong><label className="cornell-cue-label">Question or decision<textarea value={session.cornellSectionCues?.[current?.id??"context"]??""} onChange={e=>onChange({cornellSectionCues:{...session.cornellSectionCues,[current?.id??"context"]:e.target.value}})} placeholder="What does this imply? What needs evidence or a decision?" rows={4}/></label></div>}
        {sections.length ? <nav>{sections.map((s,i)=><button type="button" key={s.id} aria-current={i===activeSection&&!readAll?"location":undefined} onClick={()=>chooseSection(i)}><span>{reviewed.includes(s.id)?"✓":String(i+1).padStart(2,"0")}</span>{s.title}</button>)}</nav>:<p className="panel-help">Your outline appears when you add notes.</p>}

        {cornell&&unlinkedCues.length>0&&<details className="unlinked-cues"><summary>Unlinked questions · {unlinkedCues.length}</summary><p>These questions belonged to a section that was renamed or removed. They are preserved here.</p>{unlinkedCues.map(([id,text])=><div key={id}><p>{text}</p><button type="button" disabled={!current} title={!current?"Add source notes before attaching a question":undefined} onClick={()=>{if(!current)return;const next={...session.cornellSectionCues};delete next[id];next[current.id]=[next[current.id],text].filter(Boolean).join("\n\n");onChange({cornellSectionCues:next});}}>Attach to current section</button></div>)}</details>}
      </aside>
      <section className="document-panel" aria-label={editing?"Source editor":"Capture document"}>
        <div className="panel-heading"><div><h3>{editing?"Source notes":cornell?"Notes & evidence":"Captured direction"}</h3><p>{editing?"Paste, dictate, or edit freely. Add headings to build the outline.":"Review one section at a time. Source wording is preserved."}</p></div>{!editing&&sections.length>0&&<span className="neutral-status">{reviewed.filter(id=>sections.some(s=>s.id===id)).length}/{sections.length} reviewed · Not approved</span>}</div>
        {editing?<><label className="sr-only" htmlFor="raw-capture">Raw intake</label><textarea ref={textarea} id="raw-capture" className="source-editor" value={session.rawCapture} onChange={e=>onChange({rawCapture:e.target.value,reviewedSections:[]})} onSelect={selectText} placeholder="Start with the idea, the people, and the outcome. Add what worries you. Use a heading on its own line to organize longer notes."/><div className="source-selection"><Button variant="outline" disabled={!selection} onClick={()=>addConcern(selection)}>Add selected text as concern</Button><p>Select text inside these notes. The full selection is kept.</p></div></>:sections.length?<><div className="document-mode-bar"><span>{readAll?"Full context":`Section ${Math.min(activeSection+1,sections.length)} of ${sections.length}`}</span><button type="button" onClick={()=>setReadAll(!readAll)}>{readAll?"Return to section review":"Read all sections"}</button></div><div className="document-sections">{(readAll?sections:[current]).map((s)=><article className="active-document-section" id={s.id} key={s.id}><header><span className="section-number">{String(sections.indexOf(s)+1).padStart(2,"0")}</span><h4>{s.title}</h4></header><div className="section-content">{s.body.split(/\n\s*\n/).map((p,j)=><p key={j}>{p}</p>)}</div></article>)}</div>{!readAll&&<div className="section-review-actions"><Button variant="outline" size="sm" disabled={activeSection===0} onClick={()=>chooseSection(activeSection-1)}>Previous</Button><Button variant="outline" size="sm" onClick={markReviewed}>{reviewed.includes(current.id)?(activeSection<sections.length-1?"Reviewed · Next section":"Reviewed"):(activeSection<sections.length-1?"Mark reviewed & next":"Mark reviewed")}</Button><Button variant="ghost" size="sm" disabled={activeSection>=sections.length-1} onClick={()=>chooseSection(activeSection+1)}>Next</Button><p>Review markers are optional. They do not approve content or restrict navigation.</p></div>}</>:<div className="capture-empty"><h4>Every workshop starts with an idea.</h4><p>Add your starting notes, or try a sample in this draft.</p><Button onClick={()=>setEditing(true)}>Add source notes</Button><Button variant="ghost" onClick={onLoadSample}>Try sample workshop</Button></div>}
        {cornell&&<section className="cornell-summary"><label htmlFor="cornell-summary">Synthesis · What do these notes mean?</label><p>Write the essential understanding and the decision this workshop needs to make. This is your interpretation, separate from the source.</p><textarea id="cornell-summary" rows={4} value={session.cornellSummary??""} onChange={e=>onChange({cornellSummary:e.target.value})} placeholder="The core idea is… The important tension is… We need to decide…"/></section>}
      </section>
      <aside className="concerns-panel" aria-labelledby="concerns-title">
        <div className="panel-heading"><div><p className="nt-label">Keep in view</p><h3 id="concerns-title">Open concerns <span>{session.concerns.length}</span></h3></div></div>
        <p className="panel-help">Questions or risks to address before approving the brief. Reading a card does nothing. Only its labeled actions change it.</p>
        <button type="button" className="add-concern-toggle" aria-expanded={addingConcern} onClick={()=>setAddingConcern(!addingConcern)}>{addingConcern?"Close concern editor":"+ Add a concern"}</button>{addingConcern&&<form className="add-concern" onSubmit={e=>{e.preventDefault();addConcern(newConcern);}}><label htmlFor="new-concern">Add a concern</label><textarea id="new-concern" rows={2} value={newConcern} onChange={e=>setNewConcern(e.target.value)} placeholder="What must not get lost?"/><Button type="submit" size="sm" variant="outline" disabled={!newConcern.trim()}>Add concern</Button></form>}
        <div aria-live="polite" className="concern-notice">{notice}{removed&&<button type="button" onClick={undoRemoval}>Undo removal</button>}</div>
        {session.concerns.length?<ol className="concern-list">{session.concerns.map((c,i)=><li key={c} className="concern-card"><div className="concern-meta"><span>Concern {String(i+1).padStart(2,"0")}</span><span className="open-status">Open</span></div>{editingConcern===c?<div><label className="sr-only" htmlFor="edit-concern">Edit concern text</label><textarea id="edit-concern" className="concern-edit" value={concernDraft} onChange={e=>setConcernDraft(e.target.value)}/><div className="concern-actions"><button type="button" disabled={!concernDraft.trim()} onClick={()=>{onChange({concerns:Array.from(new Set(session.concerns.map(x=>x===c?concernDraft.trim():x)))});setEditingConcern(null);}}>Save concern</button><button type="button" onClick={()=>setEditingConcern(null)}>Cancel edit</button></div></div>:<><p>{recoverConcernText(c,session.rawCapture)}</p>{c.length===120&&recoverConcernText(c,session.rawCapture)===c&&<p className="legacy-excerpt">Imported excerpt · Edit to complete or clarify.</p>}<div className="concern-actions"><button type="button" onClick={()=>{setEditingConcern(c);setConcernDraft(recoverConcernText(c,session.rawCapture));}}>Edit</button><button type="button" onClick={()=>{onChange({concerns:session.concerns.filter(x=>x!==c),resolvedConcerns:[...(session.resolvedConcerns??[]),c]});setNotice("Concern marked resolved. Reopen it below if needed.");}}>Mark resolved</button><button type="button" className="remove-concern" onClick={()=>removeConcern(c)} aria-label={`Remove concern ${i+1}`}>Remove</button></div></>}</li>)}</ol>:<div className="concern-empty">No open concerns. Add one above whenever something needs attention.</div>}
        {(session.resolvedConcerns??[]).length>0&&<details className="resolved-list"><summary>Resolved concerns · {session.resolvedConcerns?.length}</summary>{session.resolvedConcerns?.map(c=><div key={c}><p>{c}</p><button type="button" onClick={()=>onChange({resolvedConcerns:session.resolvedConcerns?.filter(x=>x!==c),concerns:[...session.concerns,c]})}>Reopen concern</button></div>)}</details>}
        {(session.removedConcerns??[]).length>0&&<details className="removed-history"><summary>Removed concerns · {session.removedConcerns?.length}</summary>{session.removedConcerns?.map((c,i)=><div key={`${c}-${i}`}><p>{recoverConcernText(c,session.rawCapture)}</p><button type="button" onClick={()=>onChange({removedConcerns:session.removedConcerns?.filter(x=>x!==c),concerns:Array.from(new Set([...session.concerns,c]))})}>Restore concern</button></div>)}</details>}
        {suggestions.length>0&&<div className="suggestions"><button type="button" aria-expanded={showSuggestions} onClick={()=>setShowSuggestions(!showSuggestions)}>Review suggested concerns · {suggestions.length} <span aria-hidden>⌄</span></button><p>Suggestions are not added automatically.</p>{showSuggestions&&suggestions.map(c=><div key={c}><p>{c}</p><button type="button" onClick={()=>addConcern(c)}>Keep as concern</button></div>)}</div>}
      </aside>
    </div>
    <div className="stage-action-bar"><div><strong>Next: Clarify the decisions</strong><p>Your notes and concerns carry forward. You can return to Capture.</p></div><Button size="lg" disabled={session.rawCapture.trim().length<=40} onClick={onContinue}>Continue to Clarify <span aria-hidden>→</span></Button></div>
  </div>;
}
