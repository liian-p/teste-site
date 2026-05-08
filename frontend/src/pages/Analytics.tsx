// Analytics.tsx
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../api/client";

const COLORS = ["#1e90ff","#00face","#8a05be","#ff7a00","#ff4c4c","#00ff88"];

export function Analytics() {
  const { data: ranking=[] } = useQuery({
    queryKey:["ranking"],
    queryFn:()=>api.get("/api/analytics/ranking").then(r=>r.data)
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🏆 Ranking de Utilização</h1>
      <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-6">
        {(ranking as any[]).length === 0 ? (
          <p className="text-[#63676e] italic text-sm text-center py-10">Sem dados para exibir.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={ranking as any[]} layout="vertical" margin={{left:20, right:60}}>
              <XAxis type="number" stroke="#63676e" tickFormatter={(v)=>`R$ ${v.toFixed(0)}`} />
              <YAxis type="category" dataKey="name" stroke="#63676e" width={100} />
              <Tooltip formatter={(v:number)=>`R$ ${v.toFixed(2)}`} contentStyle={{background:"#161920",border:"1px solid #2b2e35",borderRadius:8}} />
              <Bar dataKey="total" radius={[0,8,8,0]}>
                {(ranking as any[]).map((_:any, i:number)=>(
                  <Cell key={i} fill={COLORS[i%COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
export default Analytics;
