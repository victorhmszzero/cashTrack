import { useState } from 'react'
import styled from 'styled-components'
import { Plus, Pencil, ToggleLeft, ToggleRight, CalendarDays } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { MoneyValue } from '../shared/MoneyValue'
import { Modal } from '../shared/Modal'
import { formatMonthLabel } from '@/utils/calculations'
import {
  Card, Flex, PageTitle, Muted,
  PrimaryButton, GhostButton, DangerButton, IconButton,
  Table, Thead, Tbody, Tfoot, Th, Td, Tr, TableWrapper,
  FormRow, Label, Input, Select, Alert, Badge,
} from '@/styles/ui'

const Toggle = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.2rem;
  border-radius: 4px;
  transition: background 0.12s;
  &:hover { background: ${p => p.theme.bg.hover}; }
`

interface Props { selectedMonth: string }

export function FixedBillsPage({ selectedMonth }: Props) {
  const { fixedBills, categories, addFixedBill, updateFixedBill, deleteFixedBill, setFixedBillOverride } = useStore()
  const [modal, setModal] = useState<any>(null)
  const [catId, setCatId] = useState<string>('')

  const getCat = (id?: string) => (categories ?? []).find(c => c.id === id)

  const total = fixedBills
    .filter(b => b.active)
    .reduce((s, b) => s + (b.overrides?.[selectedMonth] ?? b.amount), 0)

  return (
    <Flex $col $gap={4}>
      <Flex $align="center" $justify="space-between">
        <div>
          <PageTitle>Contas Fixas</PageTitle>
          <Muted $size="xs">
            Total em {formatMonthLabel(selectedMonth)}: <MoneyValue value={total} />
          </Muted>
        </div>
        <PrimaryButton onClick={() => { setCatId(''); setModal({ isNew: true }) }}>
          <Plus size={15} /> Nova conta
        </PrimaryButton>
      </Flex>

      <Card>
        <TableWrapper>
          <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th $align="right">Valor Base</Th>
                <Th $align="right">Em {formatMonthLabel(selectedMonth)}</Th>
                <Th $align="center">Ativo</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {fixedBills.map(bill => {
                const override = bill.overrides?.[selectedMonth]
                const hasOverride = override !== undefined
                return (
                  <Tr key={bill.id} $faded={!bill.active}>
                    <Td>
                      <Flex $align="center" $gap={2}>
                        {getCat(bill.categoryId) && (
                          <span style={{ fontSize: '0.875rem' }}>{getCat(bill.categoryId)!.emoji}</span>
                        )}
                        <span style={{ fontWeight: 500 }}>{bill.name}</span>
                      </Flex>
                    </Td>
                    <Td $align="right" $muted><MoneyValue value={bill.amount} /></Td>
                    <Td $align="right">
                      <MoneyValue
                        value={hasOverride ? override : bill.amount}
                        style={hasOverride ? { color: '#f97316' } as React.CSSProperties : undefined}
                      />
                    </Td>
                    <Td $align="center">
                      <Toggle onClick={() => updateFixedBill(bill.id, { active: !bill.active })}>
                        {bill.active
                          ? <ToggleRight size={22} style={{ color: '#059669' }} />
                          : <ToggleLeft  size={22} />}
                      </Toggle>
                    </Td>
                    <Td $align="right">
                      <Flex $gap={1} $justify="flex-end">
                        <IconButton title="Ajustar neste mês" onClick={() => setModal({ bill, isOverride: true })}>
                          <CalendarDays size={13} style={{ color: '#f97316' }} />
                        </IconButton>
                        <IconButton onClick={() => { setCatId(bill.categoryId || ''); setModal({ bill, isOverride: false }) }}>
                          <Pencil size={13} />
                        </IconButton>
                      </Flex>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
            <Tfoot>
              <Tr>
                <Td style={{ fontWeight: 600 }}>Total ativo</Td>
                <Td />
                <Td $align="right"><MoneyValue value={total} size="md" /></Td>
                <Td /><Td />
              </Tr>
            </Tfoot>
          </Table>
        </TableWrapper>
      </Card>

      {modal && (
        <Modal
          title={modal.isNew ? 'Nova conta fixa' : modal.isOverride ? `Ajustar em ${formatMonthLabel(selectedMonth)}` : 'Editar conta'}
          onClose={() => setModal(null)}
          size="sm"
        >
          <form onSubmit={e => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const amt  = parseFloat(fd.get('amount') as string) || 0
            const name = fd.get('name') as string
            if (modal.isOverride) {
              setFixedBillOverride(modal.bill.id, selectedMonth, amt === modal.bill.amount ? null : amt)
            } else if (modal.isNew) {
              addFixedBill({ name, amount: amt, active: true, categoryId: catId || undefined })
            } else {
              updateFixedBill(modal.bill.id, { name, amount: amt, categoryId: catId || undefined })
            }
            setModal(null)
          }}>
            {!modal.isOverride && (
              <>
                <FormRow>
                  <Label>Nome da Conta</Label>
                  <Input name="name" defaultValue={modal.bill?.name} required autoFocus />
                </FormRow>
                <FormRow>
                  <Label>Categoria</Label>
                  <Select value={catId} onChange={e => setCatId(e.target.value)}>
                    <option value="">Sem categoria</option>
                    {(categories ?? []).map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </Select>
                </FormRow>
              </>
            )}
            <FormRow>
              <Label>{modal.isOverride ? `Valor em ${formatMonthLabel(selectedMonth)}` : 'Valor Base (R$)'}</Label>
              <Input
                name="amount" type="number" step="0.01" min="0" required
                defaultValue={modal.isOverride ? (modal.bill.overrides?.[selectedMonth] ?? modal.bill.amount) : modal.bill?.amount}
                autoFocus={modal.isOverride}
              />
              {modal.isOverride && (
                <Alert $variant="info" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  Afeta apenas este mês. Os demais ficam em R$ {modal.bill.amount}.
                </Alert>
              )}
            </FormRow>
            <Flex $justify="space-between" $align="center">
              {modal.isOverride && modal.bill.overrides?.[selectedMonth] !== undefined && (
                <DangerButton type="button" onClick={() => { setFixedBillOverride(modal.bill.id, selectedMonth, null); setModal(null) }}>
                  Remover ajuste
                </DangerButton>
              )}
              <Flex $gap={2} style={{ marginLeft: 'auto' }}>
                <GhostButton type="button" onClick={() => setModal(null)}>Cancelar</GhostButton>
                <PrimaryButton type="submit">Salvar</PrimaryButton>
              </Flex>
            </Flex>
          </form>
        </Modal>
      )}
    </Flex>
  )
}