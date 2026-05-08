// Invoices.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";

export default function Invoices() {
  const [cardId, setCardId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [year] = useState(2026);
  const [filtered, setFiltered] = useState(false);

  const { data: cards=[] } = useQuery({ queryKey:["cards"], queryFn:()=>api.get("/api/cards").then(r=>r.data) });
  const { data: items=[], refetch } = useQuery({
    queryKey:["invoices", cardId, month, year],
    queryFn:()=>api.get(`/api/invoices?card_id=${cardId}&year=${year}&month=${month}`).then(r=>r.data),
    enabled: filtered && !!cardId,
  });

  const total = (items as any[]).reduce((s:number,i:any)=>s+i.amount,0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Extrato Detalhado</h1>
      <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-4 flex items-center gap-3">
        <select value={cardId} onChange={e=>setCardId(e.target.value)}
          className="bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-2 text-sm">
          <option value="">Selecionar Cartão</option>
          {(cards as any[]).map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))}
          className="bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-2 text-sm">
          {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={()=>{setFiltered(true); refetch();}}
          className="bg-[#1e90ff] hover:bg-[#1466b8] text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors">
          🔍 FILTRAR
        </button>
        <p className="ml-auto text-xl font-bold text-[#1e90ff]">TOTAL: R$ {total.toFixed(2)}</p>
      </div>

      <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 px-6 py-3 text-xs text-[#63676e] font-bold tracking-widest border-b border-[#2b2e35]">
          {["DATA","DESCRIÇÃO","PARCELA","PESSOA","VALOR"].map(h=><span key={h}>{h}</span>)}
        </div>
        {(items as any[]).length === 0 && (
          <p className="text-center py-10 text-[#63676e] italic text-sm">Nenhum lançamento para este período.</p>
        )}
        {(items as any[]).map((item:any, i:number)=>(
          <div key={i} className={`grid grid-cols-5 px-6 py-3.5 text-sm border-b border-[#1f2229] ${item.is_paid?"opacity-50":""}`}>
            <span className="text-[#8a8d91]">{item.date}</span>
            <span className="font-medium">{item.desc}</span>
            <span className="text-[#1e90ff]">{item.inst_num}/{item.inst_tot}</span>
            <span>{item.person}</span>
            <span className={`font-bold ${item.is_paid?"text-green-500":"text-[#00face]"}`}>R$ {item.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
