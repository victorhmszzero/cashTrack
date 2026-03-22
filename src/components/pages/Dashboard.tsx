// src/components/pages/Dashboard.tsx

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useStore } from '../../store/useStore'
import { computeSummaries, brl } from '../../utils/calculations'
import { MoneyValue } from '../shared/MoneyValue'
import { MonthSummary } from '../../types'

interface Props {
  selectedMonth: string
  summaries: MonthSummary[]
}
export function Dashboard({ selectedMonth, summaries }: Props) {
  const state = useStore()
  const month = summaries.find((m) => m.yearMonth === selectedMonth) ?? summaries[0]

  if (!month) return null

  const chartData = summaries.slice(0, 12).map((m) => ({
    name: m.label,
    'A Pagar': Math.round(m.netToPay),
    'Saldo': Math.round(Math.max(0, m.balance)),
    'Receber PIX': Math.round(m.pixReceivable),
  }))

  const topCards = [...month.cardTotals]
    .sort((a, b) => b.total - a.total)
    .filter((c) => c.total > 0)

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Salário" value={state.settings.salary} icon={<Wallet size={16} />} color="blue" />
        <KpiCard label="Total (Geral)" value={month.totalToPay} icon={<ArrowDownCircle size={16} className="text-red-500" />} color="red" />
        <KpiCard label="Receber PIX" value={month.pixReceivable} icon={<ArrowUpCircle size={16} className="text-emerald-500" />} color="green" />
        <KpiCard label="Custo Real (Seu)" value={month.netToPay} icon={<TrendingDown size={16} className="text-orange-500" />} color="orange" />
      </div>


      {/* Saldo breakdown */}
      {month.balance > 0 && (
        <div className="card p-4 flex gap-6 flex-wrap bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50">
          <div className="flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold">SALDO LIVRE</p>
            <MoneyValue value={month.balance} colored size="lg" />
          </div>
          <div className="w-px bg-emerald-200 dark:bg-emerald-900/50" />
          <div>
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Investir ({state.settings.investPercent}%)</p>
            <MoneyValue value={month.toInvest} size="md" />
          </div>
          <div className="w-px bg-emerald-200 dark:bg-emerald-900/50" />
          <div>
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Lazer ({100 - state.settings.investPercent}%)</p>
            <MoneyValue value={month.toLazer} size="md" />
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-300 mb-4">Próximos 12 meses</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradPay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f7596f" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f7596f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3a0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3a0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPix" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2a48" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ background: '#0d1425', border: '1px solid #1c2a48', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => brl(v)}
            />
            <Area type="monotone" dataKey="A Pagar" stroke="#f7596f" fill="url(#gradPay)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Saldo" stroke="#22d3a0" fill="url(#gradBal)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Receber PIX" stroke="#4f8ef7" fill="url(#gradPix)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-end">
          {[['#f7596f', 'A Pagar'], ['#22d3a0', 'Saldo'], ['#4f8ef7', 'Receber PIX']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cards ranking */}
        <div className="card p-5">
          <p className="text-sm font-bold mb-4">Faturas e Fixas — {month.label}</p>
          <div className="flex flex-col gap-3">
            {topCards.map((c) => {
              const pct = month.totalToPay > 0 ? (c.total / month.totalToPay) * 100 : 0
              return (
                <div key={c.cardId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{c.cardName}</span>
                    <MoneyValue value={c.total} />
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-surface-600 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
                  </div>
                </div>
              )
            })}
            {month.fixedTotal > 0 && (
              <div className="pt-2 border-t border-surface-600">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-500">Contas fixas</span>
                  <MoneyValue value={month.fixedTotal} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PIX recebidos Breakdown (NOVO) */}
        <div className="card p-5">
          <p className="text-sm font-bold mb-4">PIX a Receber — {month.label}</p>
          <div className="flex flex-col gap-3">
            {month.pixBreakdown.map((p) => {
              const pct = month.pixReceivable > 0 ? (p.total / month.pixReceivable) * 100 : 0
              return (
                <div key={p.personId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{p.personName}</span>
                    <MoneyValue value={p.total} colored />
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-surface-600 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {month.pixBreakdown.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">Nenhum PIX a receber neste mês.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label, value, icon, colored,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  colored?: boolean
}) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <MoneyValue value={value} colored={colored} size="lg" />
    </div>
  )
}
