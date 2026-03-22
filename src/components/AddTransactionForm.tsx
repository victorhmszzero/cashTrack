// src/components/AddTransactionForm.tsx

import { useState } from 'react';
import type { Parcela } from '../types';

interface Props {
  cartaoId: string;
  onAdd: (cartaoId: string, novaParcela: Parcela) => void;
}

export const AddTransactionForm = ({ cartaoId, onAdd }: Props) => {
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');
  const [totalParcelas, setTotalParcelas] = useState('1');
  const [responsavel, setResponsavel] = useState('Eu');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !valor) return;

    const nova: Parcela = {
      id: Math.random().toString(36).substr(2, 9),
      descricao: desc,
      valor: parseFloat(valor),
      parcelaAtual: 1,
      totalParcelas: parseInt(totalParcelas),
      vencimento: new Date().toISOString().split('T')[0],
      responsavel
    ***REMOVED***

    onAdd(cartaoId, nova);
    setDesc('');
    setValor('');
  ***REMOVED***

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs font-bold">Descrição</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} className="border p-1 rounded" placeholder="Ex: Sapato" />
      </div>
      <div>
        <label className="block text-xs font-bold">Valor Mensal</label>
        <input type="number" value={valor} onChange={e => setValor(e.target.value)} className="border p-1 rounded w-24" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs font-bold">Parcelas</label>
        <input type="number" value={totalParcelas} onChange={e => setTotalParcelas(e.target.value)} className="border p-1 rounded w-16" />
      </div>
      <div>
        <label className="block text-xs font-bold">Quem paga?</label>
        <select value={responsavel} onChange={e => setResponsavel(e.target.value)} className="border p-1 rounded">
          <option value="Eu">Eu</option>
          <option value="Cris">Cris</option>
          <option value="Isaura">Isaura</option>
          <option value="Edilaine">Edilaine</option>
        </select>
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded font-bold hover:bg-green-700">
        + Adicionar
      </button>
    </form>
  );
***REMOVED***