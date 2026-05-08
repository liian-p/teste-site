import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { Trash2 } from "lucide-react";

const THEMES = [
  { label:"Azul",    color:"#1e90ff" },
  { label:"Roxo",    color:"#8a2be2" },
  { label:"Verde",   color:"#00ff7f" },
  { label:"Laranja", color:"#ff4500" },
  { label:"Rosa",    color:"#ff1493" },
];

export default function SettingsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data: persons=[] } = useQuery({
    queryKey:["persons"],
    queryFn:()=>api.get("/api/persons").then(r=>r.data)
  });

  const addMut = useMutation({
    mutationFn:(n:string)=>api.post("/api/persons",{name:n}),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["persons"]}); setName(""); }
  });

  const delMut = useMutation({
    mutationFn:(id:number)=>api.delete(`/api/persons/${id}`),
    onSuccess:()=>qc.invalidateQueries({queryKey:["persons"]})
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Configurações</h1>

      {/* Pessoas */}
      <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold">Gerenciar Pessoas</h2>
        <div className="flex gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da Pessoa"
            className="flex-1 bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e90ff]" />
          <button onClick={()=>name && addMut.mutate(name)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
            Adicionar
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {(persons as any[]).map((p:any)=>(
            <div key={p.id} className="flex items-center justify-between bg-[#1f2229] rounded-xl px-4 py-3">
              <span className="text-sm">• {p.name}</span>
              <button onClick={()=>delMut.mutate(p.id)} className="text-[#8a8d91] hover:text-red-400 transition-colors">
                <Trash2 size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tema */}
      <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold">Tema do Terminal</h2>
        <p className="text-xs text-[#8a8d91]">A cor de destaque é salva localmente no navegador.</p>
        <div className="flex gap-3 flex-wrap">
          {THEMES.map(({label,color})=>(
            <button key={color}
              onClick={()=>document.documentElement.style.setProperty("--accent",color)}
              style={{background:color}}
              className="px-5 py-2 rounded-xl text-white text-sm font-bold hover:opacity-80 transition-opacity">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
