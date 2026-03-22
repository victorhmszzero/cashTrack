// src/components/FinancialTable.tsx

import type { Cartao } from '../types/finance';

interface Props {
  cartao: Cartao;
}

export const FinancialTable = ({ cartao }: Props) => {
  const totalFatura = cartao.transacoes.reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 m-4">
      <table className="min-w-full bg-white">
        <thead>
          <tr style={{ backgroundColor: cartao.cor }} className="text-white">
            <th className="py-2 px-4 text-left">Data</th>
            <th className="py-2 px-4 text-left">Descrição</th>
            <th className="py-2 px-4 text-left">Parcela</th>
            <th className="py-2 px-4 text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {cartao.transacoes.map((t) => (
            <tr key={t.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{t.vencimento}</td>
              <td className="py-2 px-4">{t.descricao}</td>
              <td className="py-2 px-4">
                {t.parcelaAtual} / {t.totalParcelas}
              </td>
              <td className="py-2 px-4 text-right text-red-600 font-medium">
                R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td colSpan={3} className="py-2 px-4 text-right">TOTAL</td>
            <td className="py-2 px-4 text-right">
              R$ {totalFatura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
***REMOVED***