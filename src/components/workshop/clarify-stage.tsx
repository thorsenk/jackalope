"use client";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {CLAIM_KIND_LABELS,LOCK_GATE_KINDS,type WorkshopSession,type Claim,type ClarifyResponse} from "@/lib/types";
export function ClarifyStage({session,onChange,onBack,onFinish}:{session:WorkshopSession;onChange:(patch:Partial<WorkshopSession>)=>void;onBack:()=>void;onFinish:()=>void}){
 const index=Math.min(session.clarifyIndex,Math.max(0,session.clarifyTurns.length-1));
 const turn=session.clarifyTurns[index];
 const kind=LOCK_GATE_KINDS[index]??"who_outcome";
 const [selected,setSelected]=useState<string>(turn?.response?.optionId??"");
 const [reframing,setReframing]=useState(false);
 const draft=session.clarifyDrafts?.[kind]??session.claims.find(c=>c.kind===kind&&c.status==="accepted")?.text??"";
 const option=turn?.options.find(o=>o.id===selected);
 if(!turn)return <section className="decision-card"><h2>Return to Capture to start the decisions.</h2><Button onClick={onBack}>Back to Capture</Button></section>;
 function move(next:number){onChange({clarifyIndex:next});setSelected("");setReframing(false);}
 function respond(type:ClarifyResponse["type"]){
   const text=reframing?draft.trim():option?.claimText;
   if(!text)return;
   const response:ClarifyResponse={type,optionId:option?.id,reframedText:reframing?text:undefined};
   const claim:Claim={id:`decision-${kind}-${Date.now()}`,kind:option?.claimKind??kind,text,status:type==="reject"?"rejected":"accepted",originalText:reframing?option?.claimText:undefined};
   const turns=session.clarifyTurns.map((t,i)=>i===index?{...t,response}:t);
   const claims=[...session.claims.filter(c=>!(c.kind===claim.kind&&c.status==="accepted")),claim];
   onChange({clarifyTurns:turns,claims,clarifyIndex:type==="reject"?index:Math.min(index+1,session.clarifyTurns.length-1)});
   if(type!=="reject"){if(index===session.clarifyTurns.length-1)onFinish();setSelected("");setReframing(false);}
 }
 return <section><div className="decision-card"><p className="nt-label">Step 02 · Clarify · Decision {index+1} of {session.clarifyTurns.length}</p><h2>{turn.prompt}</h2><p>Review a proposal, reject it, or use your own wording. Nothing becomes a decision until you accept it.</p><div className="clarify-options" role="group" aria-label="Decision proposals">{turn.options.map(o=><button key={o.id} type="button" className="clarify-option" aria-pressed={selected===o.id&&!reframing} onClick={()=>{setSelected(o.id);setReframing(false);}}><span>Proposed framing</span><strong>{o.label}</strong></button>)}</div><Button variant="outline" onClick={()=>{setReframing(true);if(!draft&&option)onChange({clarifyDrafts:{...session.clarifyDrafts,[kind]:option.claimText}});}}>Write or reframe this decision</Button>{reframing&&<><label className="decision-label" htmlFor="decision">Your wording · {CLAIM_KIND_LABELS[kind]}</label><textarea id="decision" className="decision-textarea" value={draft} onChange={e=>onChange({clarifyDrafts:{...session.clarifyDrafts,[kind]:e.target.value}})} placeholder="Keep the intent. State the decision in your own words."/></>}{option&&!reframing&&<div className="review-row"><h3>Selected proposal</h3><p>{option.claimText}</p></div>}<div className="stage-buttons"><Button disabled={reframing?!draft.trim():!option} onClick={()=>respond(reframing?"reframe":"accept")}>{reframing?"Accept revised wording":"Accept proposal"} {index===session.clarifyTurns.length-1?"& review":"& continue"}</Button><Button variant="outline" disabled={reframing?!draft.trim():!option} onClick={()=>respond("reject")}>Reject & stay on question</Button>{index>0&&<Button variant="ghost" onClick={()=>move(index-1)}>Previous decision</Button>}<Button variant="ghost" onClick={onBack}>Back to Capture</Button></div>{turn.response?.type==="reject"&&<p role="status">Proposal rejected. Choose another framing or write your own.</p>}</div><details className="review-row"><summary>Reference your captured direction · {session.concerns.length} open concerns</summary><p style={{whiteSpace:"pre-wrap",maxHeight:400,overflow:"auto"}}>{session.rawCapture}</p></details></section>;
}
