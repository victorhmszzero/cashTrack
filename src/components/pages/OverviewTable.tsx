// src/components/pages/OverviewTable.tsx

import { MonthSummary } from '../../types'
import { MoneyValue } from '../shared/MoneyValue'
import { useStore } from '../../store/useStore'
import { isActiveInMonth } from '../../utils/calculations' // << IMPORTANTE: Adicionar esse import no topo

interface Props {
  summaries: MonthSummary[]
  selectedMonth: string
  onSelectMonth: (ym: string) => void
    // summaries: MonthSummary
}

export function OverviewTable({ summaries, selectedMonth, onSelectMonth }: Props) {
  const { cards, pixPeople } = useStore()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-slate-200">Visão Geral — Todos os Meses</h2>

      <div className="card overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-surface-600 text-slate-500">
              <th className="text-left px-3 py-3 font-medium sticky left-0 bg-surface-800 z-10">Mês</th>
              {cards.map((c) => (
                <th key={c.id} className="text-right px-3 py-3 font-medium">{c.name}</th>
              ))}
              <th className="text-right px-3 py-3 font-medium text-yellow-500">Fixas</th>
              <th className="text-right px-3 py-3 font-medium border-l border-surface-600">Total</th>
              {pixPeople.map((p) => (
                <th key={p.id} className="text-right px-3 py-3 font-medium text-blue-400">{p.name}</th>
              ))}
              <th className="text-right px-3 py-3 font-medium text-green-400 border-l border-surface-600">Saldo</th>
              <th className="text-right px-3 py-3 font-medium">Investir</th>
              <th className="text-right px-3 py-3 font-medium">Lazer</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((m) => {
              const isSelected = m.yearMonth === selectedMonth
              const isNegative = m.balance < 0
              return (
                <tr
                  key={m.yearMonth}
                  onClick={() => onSelectMonth(m.yearMonth)}
                  className={`border-b border-surface-600/40 cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-900/30' : 'hover:bg-surface-700/40'}
                    ${isNegative ? 'bg-red-950/10' : ''}`}
                >
                  <td className={`px-3 py-2.5 font-medium sticky left-0 z-10
                    ${isSelected ? 'bg-blue-900/40 text-blue-300' : 'bg-surface-800 text-slate-300'}`}>
                    {m.label}
                  </td>
                  {m.cardTotals.map((ct) => (
                    <td key={ct.cardId} className="px-3 py-2.5 text-right">
                      {ct.total > 0 ? (
                        <span className="font-mono text-slate-300">
                          {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(ct.total)}
                        </span>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right font-mono text-yellow-500/80">
                    {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(m.fixedTotal)}
                  </td>
                  <td className="px-3 py-2.5 text-right border-l border-surface-600">
                    <MoneyValue value={m.totalToPay} />
                  </td>
                  {pixPeople.map((person) => {
                    const personTotal = person.items
                      .filter((i) => {
                        return i.startMonth <= m.yearMonth && (i.endMonth === null || i.endMonth >= m.yearMonth)
                      })
                      .reduce((s, i) => s + i.amountPerMonth, 0)
                    return (
                      <td key={person.id} className="px-3 py-2.5 text-right">
                        {personTotal > 0 ? (
                          <span className="font-mono text-blue-400/80">
                            {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(personTotal)}
                          </span>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className={`px-3 py-2.5 text-right border-l border-surface-600 font-mono font-medium
                    ${m.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.balance)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-400">
                    {m.toInvest > 0
                      ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(m.toInvest)
                      : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-400">
                    {m.toLazer > 0
                      ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(m.toLazer)
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
