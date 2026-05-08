// History.tsx
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";

export function History() {
  const { data: history=[], refetch } = useQuery({
    queryKey:["history"],
    queryFn:()=>api.get("/api/history").then(r=>r.data)
  });

  const total = (history as any[]).reduce((s:number,i:any)=>s+i.amount,0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Histórico de Recebimentos</h1>
        <button onClick={()=>refetch()} className="bg-[#2b2e35] hover:bg-[#1e90ff] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          🔄 ATUALIZAR
        </button>
      </div>

      <div className="flex gap-4">
        {[["TOTAL RECUPERADO",`R$ ${total.toFixed(2)}`,"#28a745"],["TRANSAÇÕES",String((history as any[]).length),"#1e90ff"]].map(([label,value,color])=>(
          <div key={label} className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-5 flex items-center gap-4 w-64">
            <div className="w-1 h-12 rounded-full" style={{background:color}}/>
            <div>
              <p className="text-xs text-[#63676e] font-bold">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 px-6 py-3 text-xs text-[#63676e] font-bold tracking-widest border-b border-[#2b2e35]">
          {["DATA","DESCRIÇÃO","PARCELA","PESSOA","VALOR"].map(h=><span key={h}>{h}</span>)}
        </div>
        {(history as any[]).map((item:any, i:number)=>(
          <div key={i} className="grid grid-cols-5 px-6 py-3.5 text-sm border-b border-[#1f2229]">
            <span className="text-[#8a8d91]">{item.date}</span>
            <span className="font-medium">✅ {item.desc}</span>
            <span className="text-[#1e90ff]">{item.inst}</span>
            <span>{item.person}</span>
            <span className="font-bold text-green-500">R$ {item.amount.toFixed(2)}</span>
          </div>
        ))}
        {(history as any[]).length===0 && (
          <p className="text-center py-10 text-[#63676e] italic text-sm">Nenhum pagamento registrado.</p>
        )}
      </div>
    </div>
  );
}
export default History;
