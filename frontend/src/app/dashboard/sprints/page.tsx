"use client";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Calendar, Target, CheckCircle2, Clock, Play, Trash2, ChevronDown, ChevronUp, Layers, Zap } from "lucide-react";
interface Sprint { id:string; name:string; goal:string; startDate:string; endDate:string; status:"planned"|"active"|"completed"; taskIds:string[]; createdAt:string; }
function loadSprints(pid:string):Sprint[]{ try{return JSON.parse(localStorage.getItem("sprints_"+pid)||"[]");}catch{return[];} }
function saveSprints(pid:string,s:Sprint[]){localStorage.setItem("sprints_"+pid,JSON.stringify(s));}
const STATUS={planned:{label:"Planned",icon:Clock,cls:"bg-slate-100 text-slate-600 border-slate-200"},active:{label:"Active",icon:Play,cls:"bg-emerald-50 text-emerald-700 border-emerald-200"},completed:{label:"Completed",icon:CheckCircle2,cls:"bg-indigo-50 text-indigo-700 border-indigo-200"}};
export default function SprintsPage(){
  const{activeProjectId,projects,tasks}=useStore();
  const activeProject=useMemo(()=>Array.isArray(projects)?projects.find((p)=>p.id===activeProjectId):undefined,[projects,activeProjectId]);
  const projectTasks=useMemo(()=>Array.isArray(tasks)?tasks.filter((t)=>t.projectId===activeProjectId):[],[tasks,activeProjectId]);
  const[sprints,setSprints]=useState<Sprint[]>([]);
  const[showCreate,setShowCreate]=useState(false);
  const[expandedId,setExpandedId]=useState<string|null>(null);
  const[formName,setFormName]=useState("");
  const[formGoal,setFormGoal]=useState("");
  const[formStart,setFormStart]=useState("");
  const[formEnd,setFormEnd]=useState("");
  const[formTaskIds,setFormTaskIds]=useState<string[]>([]);
  useEffect(()=>{if(activeProjectId)setSprints(loadSprints(activeProjectId));},[activeProjectId]);
  const handleCreate=()=>{
    if(!formName.trim()||!activeProjectId)return;
    const sprint:Sprint={id:crypto.randomUUID(),name:formName.trim(),goal:formGoal.trim(),startDate:formStart,endDate:formEnd,status:"planned",taskIds:formTaskIds,createdAt:new Date().toISOString()};
    const updated=[...sprints,sprint];setSprints(updated);saveSprints(activeProjectId,updated);
    setShowCreate(false);setFormName("");setFormGoal("");setFormStart("");setFormEnd("");setFormTaskIds([]);
  };
  const handleStatus=(id:string,status:Sprint["status"])=>{if(!activeProjectId)return;const u=sprints.map((s)=>s.id===id?{...s,status}:s);setSprints(u);saveSprints(activeProjectId,u);};
  const handleDelete=(id:string)=>{if(!activeProjectId)return;const u=sprints.filter((s)=>s.id!==id);setSprints(u);saveSprints(activeProjectId,u);};
  const toggleTask=(tid:string)=>setFormTaskIds((p)=>p.includes(tid)?p.filter((x)=>x!==tid):[...p,tid]);
  const stats={total:sprints.length,active:sprints.filter((s)=>s.status==="active").length,planned:sprints.filter((s)=>s.status==="planned").length,completed:sprints.filter((s)=>s.status==="completed").length};
  if(!activeProjectId)return(<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center"><Layers className="h-8 w-8 text-violet-500"/></div><h2 className="text-xl font-bold text-slate-900">No Project Selected</h2><p className="text-sm text-slate-500">Select a project from the sidebar to manage sprints.</p></div>);
  return(
    <div className="space-y-8 animate-slide-up max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-1 bg-violet-600 rounded-full"/><span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{activeProject?.name}</span></div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Sprint <span className="text-violet-600 underline decoration-violet-200 underline-offset-8">Planning</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl text-sm">Organise work into sprints. Assign tasks, set goals and track progress for <span className="font-bold text-slate-900">{activeProject?.name}</span>.</p>
        </div>
        <button onClick={()=>setShowCreate(true)} style={{transform:"none"}} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg transition-colors"><Plus className="h-4 w-4"/>New Sprint</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:"Total Sprints",value:stats.total,icon:Layers,color:"bg-slate-900 text-white"},{label:"Active",value:stats.active,icon:Play,color:"bg-emerald-50 text-emerald-600"},{label:"Planned",value:stats.planned,icon:Clock,color:"bg-amber-50 text-amber-600"},{label:"Completed",value:stats.completed,icon:CheckCircle2,color:"bg-indigo-50 text-indigo-600"}].map((s)=>(
          <div key={s.label} className="premium-card p-5 flex items-center gap-4"><div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",s.color)}><s.icon className="h-5 w-5"/></div><div><p className="text-xl font-black text-slate-900">{s.value}</p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p></div></div>
        ))}
      </div>
      {sprints.length===0?(
        <div className="premium-card p-16 text-center border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4"><Layers className="h-8 w-8 text-slate-200"/></div>
          <h3 className="text-base font-bold text-slate-900">No sprints yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Create your first sprint to start organising tasks into time-boxed iterations.</p>
          <button onClick={()=>setShowCreate(true)} style={{transform:"none"}} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold mx-auto transition-colors"><Plus className="h-4 w-4"/>Create First Sprint</button>
        </div>
      ):(
        <div className="space-y-4">
          {sprints.map((sprint)=>{
            const cfg=STATUS[sprint.status];const SI=cfg.icon;
            const st=projectTasks.filter((t)=>sprint.taskIds.includes(t.id));
            const done=st.filter((t)=>t.status==="done");
            const pct=st.length>0?Math.round((done.length/st.length)*100):0;
            const exp=expandedId===sprint.id;
            return(
              <div key={sprint.id} className="premium-card !p-0 overflow-hidden">
                <div className="p-6 sm:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{sprint.name}</h3>
                        <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",cfg.cls)}><SI className="h-3 w-3"/>{cfg.label}</span>
                      </div>
                      {sprint.goal&&<div className="flex items-start gap-2"><Target className="h-4 w-4 text-violet-500 mt-0.5 shrink-0"/><p className="text-sm text-slate-600 font-medium">{sprint.goal}</p></div>}
                      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 font-medium">
                        {(sprint.startDate||sprint.endDate)&&<span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5"/>{sprint.startDate?formatDate(sprint.startDate):"—"} → {sprint.endDate?formatDate(sprint.endDate):"—"}</span>}
                        <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5"/>{st.length} task{st.length!==1?"s":""}</span>
                        {st.length>0&&<span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500"/>{done.length} done</span>}
                      </div>
                      {st.length>0&&<div className="space-y-1.5 pt-1"><div className="flex justify-between text-xs font-bold text-slate-400"><span>Progress</span><span className="text-violet-600">{pct}%</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:"linear-gradient(90deg,#7c3aed,#4f46e5)"}}/></div></div>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {sprint.status==="planned"&&<button onClick={()=>handleStatus(sprint.id,"active")} style={{transform:"none"}} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"><Play className="h-3.5 w-3.5"/>Start</button>}
                      {sprint.status==="active"&&<button onClick={()=>handleStatus(sprint.id,"completed")} style={{transform:"none"}} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"><CheckCircle2 className="h-3.5 w-3.5"/>Complete</button>}
                      <button onClick={()=>setExpandedId(exp?null:sprint.id)} style={{transform:"none"}} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">{exp?<ChevronUp className="h-4 w-4"/>:<ChevronDown className="h-4 w-4"/>}</button>
                      <button onClick={()=>handleDelete(sprint.id)} style={{transform:"none"}} className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="h-4 w-4"/></button>
                    </div>
                  </div>
                </div>
                {exp&&<div className="border-t border-slate-100 bg-slate-50/60 p-6 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Tasks in this sprint</p>
                  {st.length===0?<p className="text-sm text-slate-400 text-center py-4">No tasks assigned to this sprint.</p>:(
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {st.map((task)=>(
                        <div key={task.id} className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                          <span className={cn("w-2 h-2 rounded-full shrink-0",task.status==="done"?"bg-emerald-500":task.status==="in-progress"?"bg-violet-500":task.status==="testing"?"bg-amber-500":task.status==="todo"?"bg-blue-500":"bg-slate-300")}/>
                          <span className={cn("text-xs font-semibold flex-1 truncate",task.status==="done"?"text-slate-400 line-through":"text-slate-800")}>{task.title}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider capitalize shrink-0">{task.status.replace("-"," ")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>}
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[540px] !rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-violet-600 px-8 py-7 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><Layers className="h-6 w-6 text-white"/></div>
            <div><DialogTitle className="text-2xl font-black text-white tracking-tight">New Sprint</DialogTitle><DialogDescription className="text-white/70 text-sm mt-0.5">Add a sprint to <span className="text-white font-bold">{activeProject?.name}</span></DialogDescription></div>
          </div>
          <div className="px-8 py-7 space-y-5 max-h-[65vh] overflow-y-auto no-scrollbar">
            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sprint Name <span className="text-rose-400">*</span></Label><Input value={formName} onChange={(e)=>setFormName(e.target.value)} placeholder="e.g. Sprint 1 — Authentication" className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-semibold"/></div>
            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sprint Goal <span className="text-slate-300 normal-case font-normal">(optional)</span></Label><Textarea value={formGoal} onChange={(e)=>setFormGoal(e.target.value)} placeholder="What should be achieved by the end of this sprint?" rows={2} className="rounded-2xl bg-slate-50 border-slate-200 font-medium text-sm resize-none"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Start Date</Label><Input type="date" value={formStart} onChange={(e)=>setFormStart(e.target.value)} className="h-11 rounded-xl bg-slate-50 border-slate-200 font-semibold"/></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">End Date</Label><Input type="date" value={formEnd} onChange={(e)=>setFormEnd(e.target.value)} className="h-11 rounded-xl bg-slate-50 border-slate-200 font-semibold"/></div>
            </div>
            {projectTasks.length>0&&(
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Tasks</Label><span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{formTaskIds.length} selected</span></div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                  {projectTasks.map((task)=>(
                    <label key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-violet-200 hover:bg-white cursor-pointer transition-all">
                      <input type="checkbox" checked={formTaskIds.includes(task.id)} onChange={()=>toggleTask(task.id)} className="w-4 h-4 rounded border-slate-300 text-violet-600"/>
                      <span className={cn("w-2 h-2 rounded-full shrink-0",task.status==="done"?"bg-emerald-500":task.status==="in-progress"?"bg-violet-500":task.status==="testing"?"bg-amber-500":task.status==="todo"?"bg-blue-500":"bg-slate-300")}/>
                      <span className="text-xs font-semibold text-slate-800 flex-1 truncate">{task.title}</span>
                      <span className="text-[9px] text-slate-400 font-medium capitalize shrink-0">{task.priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button onClick={()=>setShowCreate(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={!formName.trim()} style={{transform:"none"}} className="h-11 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-lg disabled:opacity-40 flex items-center gap-2 transition-colors"><Plus className="h-4 w-4"/>Create Sprint</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

