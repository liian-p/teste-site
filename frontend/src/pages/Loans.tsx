import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { Trash2, Pencil, Users, ChevronDown } from "lucide-react";

interface Loan {
  id: number;
  description: string;
  total_amount: number;
  remaining_amount: number;
  loan_date: string;
  debtor_name: string | null;
}

export default function Loans() {
  const qc = useQueryClient();
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState("");
  const [debtor, setDebtor] = useState("");
  const [editLoan, setEditLoan] = useState<Loan | null>(null);
  const [personView, setPersonView] = useState(false);

  const { data: loans = [] } = useQuery<Loan[]>({
    queryKey: ["loans"],
    queryFn: () => api.get("/api/loans").then(r => r.data),
  });

  const { data: persons = [] } = useQuery<any[]>({
    queryKey: ["persons"],
    queryFn: () => api.get("/api/persons").then(r => r.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["loans"] });

  const createMut = useMutation({
    mutationFn: (body: any) => api.post("/api/loans", body),
    onSuccess: () => { invalidate(); setDesc(""); setVal(""); setDebtor(""); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/api/loans/${id}`),
    onSuccess: invalidate,
  });

  const abateMut = useMutation({
    mutationFn: ({ id, value }: { id: number; value: number }) =>
      api.post(`/api/loans/${id}/abate`, { value }),
    onSuccess: invalidate,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      api.put(`/api/loans/${id}`, body),
    onSuccess: () => { invalidate(); setEditLoan(null); },
  });

  const handleAbate = (loan: Loan) => {
    const v = prompt(`Quanto deseja pagar de "${loan.description}"?`);
    if (v) abateMut.mutate({ id: loan.id, value: parseFloat(v.replace(",", ".")) });
  };

  const total = loans.reduce((s, l) => s + l.remaining_amount, 0);

  // Agrupar por pessoa
  const grouped: Record<string, Loan[]> = {};
  loans.forEach(l => {
    const key = l.debtor_name || "Sem identificação";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#161920] border border-[#1f2229] rounded-2xl px-6 py-5">
        <h1 className="text-xl font-bold">💰 Gestão de Empréstimos e Débitos</h1>
        <button
          onClick={() => setPersonView(v => !v)}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2a5298] text-white
                     px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Users size={16} /> Ver por Pessoa
        </button>
      </div>

      {/* View por pessoa */}
      {personView && (
        <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-[#8a8d91]">👤 Acumulado por Pessoa</h2>
          {Object.entries(grouped).map(([person, pLoans]) => (
            <div key={person} className="bg-[#1c1f26] rounded-xl p-4">
              <p className="font-bold mb-2">{person}</p>
              {pLoans.map(l => (
                <p key={l.id} className="text-sm text-[#8a8d91] ml-2">
                  • {l.description} → R$ {l.remaining_amount.toFixed(2)}
                </p>
              ))}
              <p className="text-right text-[#1e90ff] font-bold mt-2 text-sm">
                Total: R$ {pLoans.reduce((s, l) => s + l.remaining_amount, 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Formulário */}
      <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-6">
        <div className="flex gap-3 flex-wrap">
          <input
            value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Descrição (Ex: Empréstimo Nubank)"
            className="flex-1 min-w-[200px] bg-[#0f1115] border border-[#2b2e35] text-white
                       rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e90ff]"
          />
          <input
            value={val} onChange={e => setVal(e.target.value)}
            placeholder="Valor Total (R$)"
            className="w-40 bg-[#0f1115] border border-[#2b2e35] text-white
                       rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e90ff]"
          />
          <select
            value={debtor} onChange={e => setDebtor(e.target.value)}
            className="w-48 bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="">Devedor (opcional)</option>
            {persons.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <button
            onClick={() => createMut.mutate({
              description: desc,
              total_amount: parseFloat(val.replace(",", ".")),
              debtor_name: debtor || null,
            })}
            disabled={!desc || !val}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white
                       px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            Cadastrar Dívida
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#8a8d91] tracking-widest">DÍVIDAS ATIVAS</h2>
        {loans.length === 0 && (
          <p className="text-[#63676e] italic text-sm">Nenhum empréstimo ativo.</p>
        )}
        {loans.map(loan => (
          <div key={loan.id} className="bg-[#1c1f26] rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-bold">{loan.description}</p>
              <p className="text-xs text-[#8a8d91] mt-0.5">
                {loan.debtor_name ? `👤 ${loan.debtor_name} • ` : ""}
                {loan.loan_date}
              </p>
            </div>
            <div className="text-right mr-8">
              <p className="text-xs text-[#8a8d91]">Total: R$ {loan.total_amount.toFixed(2)}</p>
              <p className="text-[#1e90ff] font-bold">Restante: R$ {loan.remaining_amount.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAbate(loan)}
                className="bg-[#3d4147] hover:bg-[#52575e] text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                Abater
              </button>
              <button onClick={() => setEditLoan(loan)}
                className="bg-[#1e3a5f] hover:bg-[#2a5298] text-white px-2.5 py-1.5 rounded-lg text-xs">
                <Pencil size={12} />
              </button>
              <button onClick={() => deleteMut.mutate(loan.id)}
                className="bg-[#5a1a1a] hover:bg-red-800 text-white px-2.5 py-1.5 rounded-lg text-xs">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-[#0d1117] rounded-xl py-4 text-center">
        <p className="text-red-400 font-bold text-lg">
          Total em Dívidas: R$ {total.toFixed(2)}
        </p>
      </div>

      {/* Modal editar */}
      {editLoan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-8 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">✏️ Editar Dívida</h2>
            <input defaultValue={editLoan.description} id="edit-desc"
              className="w-full bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-3 text-sm" />
            <input defaultValue={editLoan.total_amount} id="edit-val"
              className="w-full bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-3 text-sm" />
            <input defaultValue={editLoan.debtor_name ?? ""} id="edit-debtor"
              placeholder="Devedor (opcional)"
              className="w-full bg-[#0f1115] border border-[#2b2e35] text-white rounded-xl px-4 py-3 text-sm" />
            <div className="flex gap-3">
              <button onClick={() => setEditLoan(null)}
                className="flex-1 border border-[#2b2e35] text-[#8a8d91] py-2.5 rounded-xl text-sm">
                Cancelar
              </button>
              <button onClick={() => {
                const d = (document.getElementById("edit-desc") as HTMLInputElement).value;
                const v = (document.getElementById("edit-val") as HTMLInputElement).value;
                const deb = (document.getElementById("edit-debtor") as HTMLInputElement).value;
                updateMut.mutate({ id: editLoan.id, body: {
                  description: d, total_amount: parseFloat(v), debtor_name: deb || null
                }});
              }} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
