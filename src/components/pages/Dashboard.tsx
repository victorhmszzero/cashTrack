// src\components\pages\Dashboard.tsx
import styled, { useTheme } from 'styled-components'
import { TrendingDown, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { useStore } from '@/store/useStore'
import { brl } from '@/utils/calculations'
import { MoneyValue } from '../shared/MoneyValue'
import type { MonthSummary } from '@/types'
import { Card, CardBody, Flex, Grid, Muted, SectionTitle, ProgressTrack, ProgressFill, Divider } from '@/styles/ui'

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  @media (min-width: 768px) { grid-template-columns: repeat(4, 1fr); }
`
const KpiCard = styled(Card)`padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;`
const KpiRow  = styled.div`display: flex; align-items: center; justify-content: space-between;`
const KpiLabel= styled.span`font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: ${p => p.theme.text.muted};`
const BalanceCard = styled(Card)`
  padding: 1rem 1.25rem; display: flex; align-items: center; flex-wrap: wrap; gap: 1.25rem;
  background: ${p => p.theme.success}0f; border-color: ${p => p.theme.success}40;
`
const BalanceItem = styled.div`display: flex; flex-direction: column; gap: 0.2rem;`

interface Props { selectedMonth: string; summaries: MonthSummary[] }

export function Dashboard({ selectedMonth, summaries }: Props) {
  const state = useStore()
  const theme = useTheme()
  const month = summaries.find(m => m.yearMonth === selectedMonth) ?? summaries[0]
  if (!month) return null

  const chartData = summaries.slice(0, 12).map(m => ({
    name: m.label,
    'A Pagar': Math.round(m.netToPay),
    'Saldo': Math.round(Math.max(0, m.balance)),
    'PIX': Math.round(m.pixReceivable),
  }))
  const topCards = [...month.cardTotals].sort((a, b) => b.total - a.total).filter(c => c.total > 0)
  const pieData  = month.categoryBreakdown.map(c => ({ name: `${c.emoji} ${c.categoryName}`, value: c.total, color: c.color }))

  return (
    <Flex $col $gap={6}>
      {/* KPIs */}
      <KpiGrid>
        {[
          { label: 'Salário',     value: state.settings.salary, icon: <Wallet size={15} />,           colored: false },
          { label: 'Total Geral', value: month.totalToPay,      icon: <ArrowDownCircle size={15} />,   colored: false },
          { label: 'Receber PIX', value: month.pixReceivable,   icon: <ArrowUpCircle size={15} />,     colored: true  },
          { label: 'Custo Real',  value: month.netToPay,        icon: <TrendingDown size={15} />,      colored: false },
        ].map(kpi => (
          <KpiCard key={kpi.label}>
            <KpiRow>
              <KpiLabel>{kpi.label}</KpiLabel>
              <span style={{ color: theme.text.muted }}>{kpi.icon}</span>
            </KpiRow>
            <MoneyValue value={kpi.value} colored={kpi.colored} size="lg" />
          </KpiCard>
        ))}
      </KpiGrid>

      {/* Saldo livre */}
      {month.balance > 0 && (
        <BalanceCard>
          <BalanceItem>
            <Muted $size="xs" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saldo Livre</Muted>
            <MoneyValue value={month.balance} colored size="lg" />
          </BalanceItem>
          <Divider $vertical />
          <BalanceItem>
            <Muted $size="xs">Investir ({state.settings.investPercent}%)</Muted>
            <MoneyValue value={month.toInvest} size="md" />
          </BalanceItem>
          <Divider $vertical />
          <BalanceItem>
            <Muted $size="xs">Lazer ({100 - state.settings.investPercent}%)</Muted>
            <MoneyValue value={month.toLazer} size="md" />
          </BalanceItem>
        </BalanceCard>
      )}

      {/* Gráfico de linha */}
      <Card>
        <CardBody>
          <SectionTitle style={{ marginBottom: '1rem' }}>Próximos 12 meses</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                {[['gradPay', theme.danger], ['gradBal', theme.success], ['gradPix', theme.accent]].map(([id, color]) => (
                  <linearGradient key={id} id={id as string} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color as string} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color as string} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.text.faint }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: theme.text.faint }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
              <Tooltip contentStyle={{ background: theme.bg.card, border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: 12 }} labelStyle={{ color: theme.text.primary }} formatter={(v: number) => brl(v)} />
              <Area type="monotone" dataKey="A Pagar" stroke={theme.danger}  fill="url(#gradPay)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Saldo"   stroke={theme.success} fill="url(#gradBal)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="PIX"     stroke={theme.accent}  fill="url(#gradPix)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <Flex $justify="flex-end" $gap={4} style={{ marginTop: '0.5rem' }}>
            {([[theme.danger,'A Pagar'],[theme.success,'Saldo'],[theme.accent,'PIX']] as [string,string][]).map(([color, label]) => (
              <Flex key={label} $align="center" $gap={1}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <Muted $size="xs">{label}</Muted>
              </Flex>
            ))}
          </Flex>
        </CardBody>
      </Card>

      {/* Bottom row */}
      <Grid $mdCols={2} $gap={6}>
        {/* Faturas */}
        <Card>
          <CardBody>
            <SectionTitle style={{ marginBottom: '1rem' }}>Faturas — {month.label}</SectionTitle>
            <Flex $col $gap={3}>
              {topCards.map(c => {
                const pct = month.totalToPay > 0 ? (c.total / month.totalToPay) * 100 : 0
                return (
                  <div key={c.cardId}>
                    <Flex $justify="space-between" $align="center" style={{ marginBottom: '0.3rem' }}>
                      <Muted $size="xs" style={{ fontWeight: 600 }}>{c.cardName}</Muted>
                      <MoneyValue value={c.total} />
                    </Flex>
                    <ProgressTrack><ProgressFill $pct={pct} /></ProgressTrack>
                  </div>
                )
              })}
              {month.fixedTotal > 0 && (
                <>
                  <Divider />
                  <Flex $justify="space-between" $align="center">
                    <Muted $size="xs" style={{ fontWeight: 600 }}>Contas fixas</Muted>
                    <MoneyValue value={month.fixedTotal} />
                  </Flex>
                  <ProgressTrack>
                    <ProgressFill $pct={month.totalToPay > 0 ? (month.fixedTotal / month.totalToPay) * 100 : 0} />
                  </ProgressTrack>
                </>
              )}
            </Flex>
          </CardBody>
        </Card>

        {/* Categorias — pizza */}
        <Card>
          <CardBody>
            <SectionTitle style={{ marginBottom: '0.5rem' }}>Por Categoria — {month.label}</SectionTitle>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => brl(v)} contentStyle={{ background: theme.bg.card, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <Flex $col $gap={1} style={{ marginTop: '0.5rem' }}>
                  {pieData
                  .sort((a, b) => b.value - a.value)
                  .map(d => (
                    <Flex key={d.name} $justify="space-between" $align="center">
                      <Flex $align="center" $gap={2}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <Muted $size="xs">{d.name}</Muted>
                      </Flex>
                      <Muted $size="xs" style={{ fontFamily: 'monospace' }}>{brl(d.value)}</Muted>
                    </Flex>
                  ))}
                </Flex>
              </>
            ) : (
              <Muted style={{ display: 'block', textAlign: 'center', padding: '2rem 0', fontSize: '0.8rem' }}>
                Nenhuma compra categorizada este mês.<br/>Vá em <strong>Categorias</strong> para configurar.
              </Muted>
            )}
          </CardBody>
        </Card>
      </Grid>

      {/* PIX breakdown */}
      {month.pixBreakdown.length > 0 && (
        <Card>
          <CardBody>
            <SectionTitle style={{ marginBottom: '1rem' }}>PIX a Receber — {month.label}</SectionTitle>
            <Flex $col $gap={3}>
              {month.pixBreakdown.map(p => {
                const pct = month.pixReceivable > 0 ? (p.total / month.pixReceivable) * 100 : 0
                return (
                  <div key={p.personId}>
                    <Flex $justify="space-between" $align="center" style={{ marginBottom: '0.3rem' }}>
                      <Muted $size="xs" style={{ fontWeight: 600 }}>{p.personName}</Muted>
                      <MoneyValue value={p.total} colored />
                    </Flex>
                    <ProgressTrack><ProgressFill $pct={pct} $color={theme.success} /></ProgressTrack>
                  </div>
                )
              })}
            </Flex>
          </CardBody>
        </Card>
      )}
    </Flex>
  )
}
