"use client";
import {STAGE_LABELS,STAGE_ORDER,type Stage} from "@/lib/types";
const hints:Record<Stage,string>={capture:"Collect ideas & concerns",clarify:"Make the key decisions",lock:"Review & approve",handoff:"Export the brief"};
export function StageRail({stage,onSelect,allowUpTo}:{stage:Stage;onSelect?:(s:Stage)=>void;allowUpTo?:Stage}){const max=STAGE_ORDER.indexOf(allowUpTo??stage);return <nav className="workflow-rail" aria-label="Workshop steps"><ol>{STAGE_ORDER.map((s,i)=><li key={s}><button type="button" disabled={i>max||!onSelect} aria-current={s===stage?"step":undefined} onClick={()=>onSelect?.(s)}><span className="step-number">{String(i+1).padStart(2,"0")}</span><span><strong>{STAGE_LABELS[s]}</strong><small>{hints[s]}</small></span></button></li>)}</ol></nav>;}
