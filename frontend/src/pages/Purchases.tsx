// ============================================================
// Purchases.tsx
// ============================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { Trash2, Pencil } from "lucide-react";

export function Purchases() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ description:"", total_amount:"", purchase_date: new Date().toISOString().slice(0,10), installments_count:"1", person_id:"", card_id:"" });

  const { data: persons=[] } = useQuery({ queryKey:["persons"], queryFn:()=>api.get("/api/persons").then(r=>r.data) });
  const { data: cards=[] } = useQuery({ queryKey:["cards"], queryFn:()=>api.get("/api/cards").then(r=>r.data) });
  const { data: purchases=[] } = useQuery({ queryKey:["purchases"], queryFn:()=>api.get("/api/purchases").then(r=>r.data) });

  const createMut = useMutation({
    mutationFn:(body:any)=>api.post("/api/purchases", body),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["purchases"]}); setForm(f=>({...f, description:"", total_amount:""})); }
  });
  const deleteMut = useMutation({
    mutationFn:(id:number)=>api.delete(`/api/purchases/${id}`),
    onSuccess:()=>qc.invalidateQueries({queryKey:["purchases"]})
  });

  const f = (k:string, v:string) => setForm(prev=>({...prev,[k]:v}));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestão de Compras</h1>
      <div className="grid grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-6 space-y-4">
          <p className="text-xs text-[#1e90ff] font-bold tracking-widest">📝 NOVO LANÇAMENTO</p>
          {[["Descrição","description","text"],["Valor (R$)","total_amount","number"],["Data","purchase_date","date"]].map(([ph,k,t])=>(
            <input key={k} type={t} placeholder={ph} value={(form as any)[k]} onChange={e=>f(k,e.target.value)}
              className="w-full bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e90ff]" />
          ))}
          <div className="grid grid-cols-2 gap-3">
            <select value={form.installments_count} onChange={e=>f("installments_count",e.target.value)}
              className="bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-3 text-sm">
              {Array.from({length:12},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}x</option>)}
            </select>
            <select value={form.card_id} onChange={e=>f("card_id",e.target.value)}
              className="bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-3 text-sm">
              <option value="">Cartão</option>
              {(cards as any[]).map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <select value={form.person_id} onChange={e=>f("person_id",e.target.value)}
            className="w-full bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-3 text-sm">
            <option value="">Pessoa</option>
            {(persons as any[]).map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={()=>createMut.mutate({...form, total_amount:parseFloat(form.total_amount), installments_count:parseInt(form.installments_count), person_id:parseInt(form.person_id), card_id:parseInt(form.card_id)})}
            className="w-full bg-[#1e90ff] hover:bg-[#1466b8] text-white font-bold py-3 rounded-xl text-sm transition-colors">
            CONFIRMAR LANÇAMENTO
          </button>
        </div>

        {/* Feed */}
        <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-6 overflow-y-auto max-h-[600px]">
          <p className="text-xs text-[#63676e] font-bold tracking-widest mb-4">🕒 ÚLTIMOS REGISTROS</p>
          <div className="space-y-3">
            {(purchases as any[]).map((p:any)=>(
              <div key={p.id} className="bg-[#1f2229] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{p.desc}</p>
                  <p className="text-xs text-[#8a8d91]">{p.date} • {p.person}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[#1e90ff] font-bold text-sm">R$ {p.amount.toFixed(2)}</p>
                  <button onClick={()=>deleteMut.mutate(p.id)} className="text-[#8a8d91] hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Purchases;
