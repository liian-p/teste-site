import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/client";
import { RefreshCw } from "lucide-react";

const COLORS = ["#1e90ff", "#00face", "#8a05be", "#ff7a00", "#ff4c4c", "#00ff88"];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function KpiCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-6 flex items-center gap-4">
      <div className="w-1.5 h-16 rounded-full shrink-0" style={{ background: color }} />
      <div>
        <p className="text-xs text-[#63676e] font-bold tracking-widest">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">R$ {value.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const year = 2026;

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["dashboard", month, year],
    queryFn: () => api.get(`/api/dashboard?month=${month}&year=${year}`).then(r => r.data),
  });

  const { data: persons } = useQuery({
    queryKey: ["persons"],
    queryFn: () => api.get("/api/persons").then(r => r.data),
  });

  const [selectedPerson, setSelectedPerson] = useState("");
  const { data: personDetail } = useQuery({
    queryKey: ["personDetail", selectedPerson, month, year],
    queryFn: () => api.get(`/api/dashboard/person?name=${selectedPerson}&month=${month}&year=${year}`).then(r => r.data),
    enabled: !!selectedPerson,
  });

  const pieData = data
    ? Object.entries(data.totais_pessoas as Record<string, number>)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Analítico</h1>
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="bg-[#161920] border border-[#2b2e35] text-white rounded-xl px-4 py-2 text-sm"
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button
            onClick={() => refetch()}
            className="bg-[#1e90ff] hover:bg-[#1466b8] text-white px-4 py-2 rounded-xl
                       flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            ATUALIZAR
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard title="TOTAL GERAL" value={data?.total_geral ?? 0} color="#1e90ff" />
        <KpiCard title="INTER" value={data?.totais_cartoes?.INTER ?? 0} color="#FF7A00" />
        <KpiCard title="NUBANK" value={data?.totais_cartoes?.NUBANK ?? 0} color="#8A05BE" />
      </div>

      {/* Consulta por pessoa */}
      <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-5 flex items-center gap-6">
        <div>
          <p className="text-xs text-[#1e90ff] font-bold tracking-widest mb-2">CONSULTA POR PESSOA</p>
          <select
            value={selectedPerson}
            onChange={e => setSelectedPerson(e.target.value)}
            className="bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-2 text-sm w-60"
          >
            <option value="">Selecione...</option>
            {persons?.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        {personDetail && (
          <p className="text-4xl font-bold text-[#00face] ml-auto">
            R$ {personDetail.total?.toFixed(2)}
          </p>
        )}
      </div>

      {/* Grid pendências + gráfico */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-5">
          <p className="text-xs text-[#63676e] font-bold tracking-widest mb-4">PENDÊNCIAS POR PESSOA</p>
          <div className="space-y-2">
            {data && Object.entries(data.totais_pessoas as Record<string, number>)
              .filter(([, v]) => v > 0)
              .map(([name, total]) => (
                <div key={name} className="flex justify-between items-center bg-[#1f2229] px-4 py-3 rounded-xl">
                  <span className="text-sm">{name}</span>
                  <span className="text-sm font-bold text-red-400">R$ {(total as number).toFixed(2)}</span>
                </div>
              ))}
            {(!data || pieData.length === 0) && (
              <p className="text-[#63676e] text-sm italic">Sem dados para este mês</p>
            )}
          </div>
        </div>

        <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-5 flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                     dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                     labelLine={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#63676e] italic text-sm">Sem dados para este mês</p>
          )}
        </div>
      </div>
    </div>
  );
}
