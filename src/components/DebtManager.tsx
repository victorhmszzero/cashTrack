// src/components/DebtManager.tsx

import type { BancoDivida } from "../types";

interface DebtProps {
  saldoDisponivel: number; // O que sobrou após pagar os cartões
  dividas: BancoDivida[];
}

export const DebtManager = ({ saldoDisponivel, dividas }: DebtProps) => {
  let saldoRestante = saldoDisponivel;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-orange-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-orange-600">Estratégia de Quitação</h2>
      <div className="space-y-4">
        {dividas.sort((a, b) => a.prioridade - b.prioridade).map((divida) => {
          const pagamento = Math.min(saldoRestante, divida.valorNegativo);
          const novoValor = divida.valorNegativo - (pagamento > 0 ? pagamento : 0);
          if (pagamento > 0) saldoRestante -= pagamento;

          return (
            <div key={divida.nome} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{divida.nome}</span>
                <span className="text-red-500 font-mono">
                  R$ {divida.valorNegativo.toFixed(2)}
                </span>
              </div>
              
              {pagamento > 0 && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  Abatimento este mês: + R$ {pagamento.toFixed(2)}
                </div>
              )}
              
              <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all" 
                  style={{ width: `${(pagamento / divida.valorNegativo) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Saldo projetado após pagamento: R$ {novoValor.toFixed(2)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
***REMOVED***