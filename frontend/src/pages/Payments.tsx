import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

export default function Payments() {
  const qc = useQueryClient();
  const [person, setPerson] = useState("");
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const year = 2026;
  const [filtered, setFiltered] = useState(false);

  const { data: persons=[] } = useQuery({ queryKey:["persons"], queryFn:()=>api.get("/api/persons").then(r=>r.data) });
  const { data: items=[], refetch } = useQuery({
    queryKey:["payments", person, month, year],
    queryFn:()=>api.get(`/api/payments?person=${person}&month=${month}&year=${year}`).then(r=>r.data),
    enabled: filtered && !!person,
  });

  const toggleMut = useMutation({
    mutationFn:(id:number)=>api.post(`/api/payments/${id}/toggle`),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["payments"]}); refetch(); }
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#161920] border border-[#1f2229] rounded-2xl px-6 py-4 flex items-center gap-4">
        <h1 className="text-xl font-bold">Gestão de Pagamentos</h1>
        <select value={person} onChange={e=>setPerson(e.target.value)}
          className="bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-2 text-sm">
          <option value="">Pessoa</option>
          {(persons as any[]).map((p:any)=><option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))}
          className="bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-2 text-sm">
          {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={()=>{setFiltered(true);refetch();}}
          className="bg-[#1e90ff] hover:bg-[#1466b8] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          Filtrar
        </button>
      </div>

      <div className="space-y-3">
        {(items as any[]).length === 0 && filtered && (
          <p className="text-[#63676e] italic text-sm">Nenhuma parcela encontrada.</p>
        )}
        {(items as any[]).map((item:any)=>(
          <div key={item.inst_id}
            className={`flex items-center justify-between rounded-xl px-5 py-4 border-l-4 ${
              item.card==="INTER" ? "border-orange-500" : "border-purple-600"
            } ${item.is_paid ? "bg-[#121418] opacity-60" : "bg-[#1f2229]"}`}>
            <div>
              <p className={`font-bold text-sm ${item.is_paid?"text-[#8a8d91]":"text-white"}`}>
                {item.desc} ({item.inst_num}/{item.inst_tot})
              </p>
              <p className="text-xs text-[#8a8d91]">{item.card}</p>
            </div>
            <div className="flex items-center gap-6">
              <p className={`font-bold ${item.is_paid?"text-[#8a8d91]":"text-[#00face]"}`}>
                R$ {item.amount.toFixed(2)}
              </p>
              <button onClick={()=>toggleMut.mutate(item.inst_id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  item.is_paid
                    ? "bg-[#343a40] hover:bg-[#52575e] text-white"
                    : "bg-[#1e90ff] hover:bg-[#1466b8] text-white"
                }`}>
                {item.is_paid ? "Reabrir" : "Confirmar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
