// src/App.tsx

import { useState, useEffect } from 'react';
import type { Cartao, Parcela, BancoDivida } from './types';
import { FinancialTable } from './components/FinancialTable';
import { DebtManager } from './components/DebtManager';
import { AddTransactionForm } from './components/AddTransactionForm';

function App() {
  // 1. Carregar dados do LocalStorage ao iniciar
  const [cartoes, setCartoes] = useState<Cartao[]>(() => {
    const saved = localStorage.getItem('@MinhasContas:cartoes');
    return saved ? JSON.parse(saved) : [];
  });

  const [salario, setSalario] = useState(2000);
  const [abaAtiva, setAbaAtiva] = useState('home');

  // 2. Salvar no LocalStorage sempre que algo mudar
  useEffect(() => {
    localStorage.setItem('@MinhasContas:cartoes', JSON.stringify(cartoes));
  }, [cartoes]);

  // Funções de manipulação
  const adicionarTransacao = (cartaoId: string, nova: Parcela) => {
    setCartoes(prev => prev.map(c => 
      c.id === cartaoId ? { ...c, transacoes: [...c.transacoes, nova] } : c
    ));
  ***REMOVED***

  const proximaParcela = (cartaoId: string, transacaoId: string) => {
    setCartoes(prev => prev.map(c => ({
      ...c,
      transacoes: c.transacoes.map(t => 
        t.id === transacaoId ? { ...t, parcelaAtual: Math.min(t.parcelaAtual + 1, t.totalParcelas) } : t
      )
    })));
  ***REMOVED***

  // Cálculos Automáticos
  const todasTransacoes = cartoes.flatMap(c => c.transacoes);
  const totalFaturas = todasTransacoes.reduce((acc, t) => acc + t.valor, 0);
  
  // O que as outras pessoas devem pagar (Soma de tudo que não é 'Eu')
  const totalAReceber = todasTransacoes
    .filter(t => t.responsavel !== 'Eu')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoFinal = (salario + totalAReceber) - totalFaturas;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <nav className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button 
          onClick={() => setAbaAtiva('home')}
          className={`px-6 py-2 rounded-full font-bold ${abaAtiva === 'home' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Resumo Geral
        </button>
        {cartoes.map(c => (
          <button 
            key={c.id} 
            onClick={() => setAbaAtiva(c.id)}
            className={`px-6 py-2 rounded-full font-bold transition-all`}
            style={{ 
              backgroundColor: abaAtiva === c.id ? c.cor : '#e5e7eb',
              color: abaAtiva === c.id ? 'white' : 'black'
            }}
          >
            {c.nome}
          </button>
        ))}
        <button 
          onClick={() => {
            const nome = prompt('Nome do Cartão?');
            if(nome) setCartoes([...cartoes, { id: Date.now().toString(), nome, cor: '#'+Math.floor(Math.random()*16777215).toString(16), diaVencimento: 10, transacoes: [] }]);
          }}
          className="px-6 py-2 rounded-full bg-dashed border-2 border-gray-400 text-gray-600 font-bold"
        >
          + Novo Cartão
        </button>
      </nav>

      {abaAtiva === 'home' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-700 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-blue-100">Meu Salário</h3>
              <input type="number" value={salario} onChange={e => setSalario(Number(e.target.value))} className="bg-transparent text-3xl font-bold border-b w-full outline-none" />
              <div className="mt-4">
                <p className="text-sm opacity-80">Saldo após pagar tudo:</p>
                <p className={`text-2xl font-bold ${saldoFinal < 0 ? 'text-red-300' : 'text-green-300'}`}>
                  R$ {saldoFinal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <DebtManager 
                saldoDisponivel={saldoFinal > 0 ? saldoFinal : 0} 
                dividas={[
                  { nome: 'Santander', valorNegativo: 1298.00, prioridade: 1 },
                  { nome: 'Bradesco', valorNegativo: 1342.25, prioridade: 2 }
                ]} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold text-lg mb-4">Pessoas que devem pagar este mês (SZD)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Cris', 'Isaura', 'Edilaine', 'Day'].map(pess => {
                const valorPess = todasTransacoes
                  .filter(t => t.responsavel === pess)
                  .reduce((acc, t) => acc + t.valor, 0);
                return (
                  <div key={pess} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-500 text-sm">{pess}</p>
                    <p className="text-xl font-bold text-blue-600">R$ {valorPess.toFixed(2)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow">
          <AddTransactionForm 
            cartaoId={abaAtiva} 
            onAdd={adicionarTransacao} 
          />
          <FinancialTable 
            cartao={cartoes.find(c => c.id === abaAtiva)!} 
          />
          {/* Botão de "Pagar Parcelas" na tabela pode ser adicionado aqui */}
        </div>
      )}
    </div>
  );
}

export default App;