import styled from 'styled-components'
import { MonthSummary } from '@/types'
import { MoneyValue } from '../shared/MoneyValue'
import { useStore } from '@/store/useStore'
import { Card, PageTitle, Flex, TableWrapper, Table, Thead, Tbody, Th, Td, Tr } from '@/styles/ui'

const StickyTh = styled(Th)`
  position: sticky;
  left: 0;
  z-index: 11;
  background: ${p => p.theme.bg.card***REMOVED***
`

const StickyTd = styled(Td)<{ $selected: boolean }>`
  position: sticky;
  left: 0;
  z-index: 5;
  background: ${p => p.$selected ? p.theme.accent + '20' : p.theme.bg.card***REMOVED***
  font-weight: 600;
  color: ${p => p.$selected ? p.theme.accent : p.theme.text.primary***REMOVED***
`

const AccentMono = styled.span`
  font-family: ${p => p.theme.font.mono***REMOVED***
  font-size: 0.75rem;
  color: ${p => p.theme.accent***REMOVED***
  opacity: 0.85;
`

const SuccessMono = styled.span`
  font-family: ${p => p.theme.font.mono***REMOVED***
  font-size: 0.75rem;
  color: ${p => p.theme.success***REMOVED***
  font-weight: 600;
`

const DangerMono = styled.span`
  font-family: ${p => p.theme.font.mono***REMOVED***
  font-size: 0.75rem;
  color: ${p => p.theme.danger***REMOVED***
  font-weight: 600;
`

const WarnMono = styled.span`
  font-family: ${p => p.theme.font.mono***REMOVED***
  font-size: 0.75rem;
  color: ${p => p.theme.warning***REMOVED***
  opacity: 0.85;
`

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(v)

interface Props {
  summaries: MonthSummary[]
  selectedMonth: string
  onSelectMonth: (ym: string) => void
}

export function OverviewTable({ summaries, selectedMonth, onSelectMonth }: Props) {
  const { cards, pixPeople } = useStore()

  return (
    <Flex $col $gap={4}>
      <PageTitle>Visão Geral — Todos os Meses</PageTitle>

      <Card>
        <TableWrapper>
          <Table>
            <Thead>
              <Tr>
                <StickyTh>Mês</StickyTh>
                {cards.map(c => <Th key={c.id} $align="right">{c.name}</Th>)}
                <Th $align="right">
                  <WarnMono style={{ fontWeight: 700 }}>Fixas</WarnMono>
                </Th>
                <Th $align="right" style={{ borderLeft: '1px solid' }}>Total</Th>
                {pixPeople.map(p => (
                  <Th key={p.id} $align="right">
                    <AccentMono style={{ fontWeight: 700 }}>{p.name}</AccentMono>
                  </Th>
                ))}
                <Th $align="right" style={{ borderLeft: '1px solid' }}>
                  <SuccessMono style={{ fontWeight: 700 }}>Saldo</SuccessMono>
                </Th>
                <Th $align="right">Investir</Th>
                <Th $align="right">Lazer</Th>
              </Tr>
            </Thead>
            <Tbody>
              {summaries.map(m => {
                const isSel = m.yearMonth === selectedMonth
                return (
                  <Tr
                    key={m.yearMonth}
                    $clickable
                    $selected={isSel}
                    $negative={!isSel && m.balance < 0}
                    onClick={() => onSelectMonth(m.yearMonth)}
                  >
                    <StickyTd $selected={isSel}>{m.label}</StickyTd>

                    {m.cardTotals.map(ct => (
                      <Td key={ct.cardId} $align="right" $mono>
                        {ct.total > 0 ? fmt(ct.total) : <span style={{ opacity: 0.25 }}>—</span>}
                      </Td>
                    ))}

                    <Td $align="right">
                      {m.fixedTotal > 0
                        ? <WarnMono>{fmt(m.fixedTotal)}</WarnMono>
                        : <span style={{ opacity: 0.25 }}>—</span>}
                    </Td>

                    <Td $align="right" style={{ borderLeft: '1px solid rgba(0,0,0,0.06)' }}>
                      <MoneyValue value={m.totalToPay} />
                    </Td>

                    {pixPeople.map(person => {
                      const entry = m.pixBreakdown.find(pb => pb.personId === person.id)
                      const total = entry?.total ?? 0
                      return (
                        <Td key={person.id} $align="right">
                          {total > 0
                            ? <AccentMono>{fmt(total)}</AccentMono>
                            : <span style={{ opacity: 0.25 }}>—</span>}
                        </Td>
                      )
                    })}

                    <Td $align="right" style={{ borderLeft: '1px solid rgba(0,0,0,0.06)' }}>
                      {m.balance >= 0
                        ? <SuccessMono>{fmt(m.balance)}</SuccessMono>
                        : <DangerMono>{fmt(m.balance)}</DangerMono>}
                    </Td>

                    <Td $align="right" $muted $mono>
                      {m.toInvest > 0 ? fmt(m.toInvest) : <span style={{ opacity: 0.25 }}>—</span>}
                    </Td>
                    <Td $align="right" $muted $mono>
                      {m.toLazer > 0 ? fmt(m.toLazer) : <span style={{ opacity: 0.25 }}>—</span>}
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableWrapper>
      </Card>
    </Flex>
  )
}