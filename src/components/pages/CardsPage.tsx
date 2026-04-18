// src\components\pages\CardsPage.tsx
import { useState } from 'react'
import styled from 'styled-components'
import { Plus, Pencil, Trash2, CreditCard, ChevronDown, ChevronRight, CalendarDays } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { MoneyValue } from '../shared/MoneyValue'
import { PurchaseModal } from '../modals/PurchaseModal'
import { Modal } from '../shared/Modal'
import { isActiveInMonth, getCurrentInstallment, formatMonthLabel } from '@/utils/calculations'
import type { CreditCard as CardType, Purchase } from '@/types'
import {
  Card, Flex, PageTitle, Muted, Badge,
  PrimaryButton, SmallPrimaryButton, GhostButton, DangerButton, IconButton,
  Table, Thead, Tbody, Th, Td, Tr, TableWrapper,
  FormRow, Label, Input, Alert,
} from '@/styles/ui'

const CardHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: ${p => p.theme.font.sans};
  transition: background 0.12s;
  &:hover { background: ${p => p.theme.bg.hover}; }
`
const CardIcon = styled.div`
  width: 2rem; height: 2rem;
  border-radius: ${p => p.theme.radius.sm};
  background: ${p => p.theme.bg.subtle};
  border: 1px solid ${p => p.theme.border};
  display: flex; align-items: center; justify-content: center;
  color: ${p => p.theme.accent}; flex-shrink: 0;
`
const CardName = styled.p`
  font-size: 0.875rem; font-weight: 600;
  color: ${p => p.theme.text.primary}; margin: 0; text-align: left;
`
const ExpandedSection = styled.div`border-top: 1px solid ${p => p.theme.border};`
const ExpandedToolbar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.625rem 1rem; background: ${p => p.theme.bg.hover};
  flex-wrap: wrap; gap: 0.5rem;
`
const CategoryDot = styled.span<{ $color: string }>`
  display: inline-block; width: 7px; height: 7px;
  border-radius: 50%; background: ${p => p.$color}; flex-shrink: 0;
`

interface Props { selectedMonth: string }

export function CardsPage({ selectedMonth }: Props) {
  const {
    cards, pixPeople, categories,
    addCard, updateCard, deleteCard,
    addPurchase, updatePurchase, deletePurchase, setPurchaseOverride,
  } = useStore()

  const [expandedCard, setExpandedCard] = useState<string | null>(cards[0]?.id ?? null)
  const [purchaseModal, setPurchaseModal] = useState<{ cardId: string; purchase?: Purchase } | null>(null)
  const [cardModal, setCardModal] = useState<{ card?: CardType } | null>(null)
  const [overrideModal, setOverrideModal] = useState<{ cardId: string; purchase: Purchase } | null>(null)
  const [newCardName, setNewCardName] = useState('')
  const [newCardDay, setNewCardDay] = useState(10)
  const [sortKey, setSortKey] = useState<'name' | 'period' | 'paidBy' | 'amount'>('period')
  const [sortDesc, setSortDesc] = useState(false)

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc)
    else { setSortKey(key); setSortDesc(false) }
  }
  const getPersonName = (id: string) => pixPeople.find(p => p.id === id || p.name === id)?.name ?? id
  const getCategoryById = (id?: string) => (categories ?? []).find(c => c.id === id)
  const sortIndicator = (key: typeof sortKey) => sortKey === key ? (sortDesc ? ' ▼' : ' ▲') : ''

  return (
    <Flex $col $gap={4}>
      <Flex $align="center" $justify="space-between">
        <PageTitle>Cartões de Crédito</PageTitle>
        <PrimaryButton onClick={() => setCardModal({})}><Plus size={15} /> Novo cartão</PrimaryButton>
      </Flex>

      {cards.map(card => {
        const activeTotal = card.purchases
          .filter(p => isActiveInMonth(p.startMonth, p.endMonth, selectedMonth))
          .reduce((s, p) => s + (p.overrides?.[selectedMonth] ?? p.amountPerMonth), 0)
        const expanded = expandedCard === card.id

        return (
          <Card key={card.id}>
            <CardHeader onClick={() => setExpandedCard(prev => prev === card.id ? null : card.id)}>
              <Flex $align="center" $gap={3}>
                <CardIcon><CreditCard size={15} /></CardIcon>
                <div style={{ textAlign: 'left' }}>
                  <CardName>{card.name}</CardName>
                  <Muted $size="xs">Vence dia {card.dueDay}</Muted>
                </div>
              </Flex>
              <Flex $align="center" $gap={3}>
                <MoneyValue value={activeTotal} />
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Flex>
            </CardHeader>

            {expanded && (
              <ExpandedSection>
                <ExpandedToolbar>
                  <Muted $size="xs">{card.purchases.length} compra(s)</Muted>
                  <Flex $gap={2}>
                    <GhostButton onClick={() => setCardModal({ card })}><Pencil size={13} /> Editar</GhostButton>
                    <DangerButton onClick={() => { if (confirm(`Excluir cartão ${card.name}?`)) deleteCard(card.id) }}>
                      <Trash2 size={13} /> Excluir
                    </DangerButton>
                    <SmallPrimaryButton onClick={() => setPurchaseModal({ cardId: card.id })}>
                      <Plus size={13} /> Compra
                    </SmallPrimaryButton>
                  </Flex>
                </ExpandedToolbar>

                <TableWrapper>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th $clickable onClick={() => handleSort('name')}>Nome{sortIndicator('name')}</Th>
                        <Th $clickable onClick={() => handleSort('period')}>Período{sortIndicator('period')}</Th>
                        <Th $clickable onClick={() => handleSort('paidBy')}>Pago por{sortIndicator('paidBy')}</Th>
                        <Th $align="right" $clickable onClick={() => handleSort('amount')}>Valor/mês{sortIndicator('amount')}</Th>
                        <Th />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {[...card.purchases]
                        .sort((a, b) => {
                          let vA: string | number
                          let vB: string | number
                          if (sortKey === 'name')        { vA = a.name.toLowerCase(); vB = b.name.toLowerCase() }
                          else if (sortKey === 'paidBy') { vA = getPersonName(a.paidBy||'').toLowerCase(); vB = getPersonName(b.paidBy||'').toLowerCase() }
                          else if (sortKey === 'amount') { vA = a.amountPerMonth; vB = b.amountPerMonth }
                          else                           { vA = a.startMonth; vB = b.startMonth }
                          return vA < vB ? (sortDesc ? 1 : -1) : vA > vB ? (sortDesc ? -1 : 1) : 0
                        })
                        .map(p => {
                          const active = isActiveInMonth(p.startMonth, p.endMonth, selectedMonth)
                          const installNum   = getCurrentInstallment(p.startMonth, selectedMonth)
                          const totalInstall = p.endMonth ? getCurrentInstallment(p.startMonth, p.endMonth) : null
                          const isSingle     = totalInstall === 1
                          const hasOverride  = p.overrides?.[selectedMonth] !== undefined
                          const displayValue = p.overrides?.[selectedMonth] ?? p.amountPerMonth
                          const cat = getCategoryById(p.categoryId)

                          return (
                            <Tr key={p.id} $faded={!active}>
                              <Td>
                                <Flex $align="center" $gap={1} style={{ marginBottom: '0.1rem' }}>
                                  {cat && <CategoryDot $color={cat.color} title={cat.name} />}
                                  <p style={{ fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>{p.name}</p>
                                </Flex>
                                {p.notes && <p style={{ opacity: 0.55, fontSize: '0.675rem', margin: '3px 0 0' }}>{p.notes}</p>}
                                {/* Mostra parcela só quando há mais de 1 */}
                                {!isSingle && totalInstall && active && (
                                  <Muted $size="xs">Parcela {installNum}/{totalInstall}</Muted>
                                )}
                                {isSingle && active && <Muted $size="xs">Compra única</Muted>}
                                {!p.endMonth && active && <Badge $color="#059669">Recorrente</Badge>}
                                {hasOverride && active && <Badge $color="#f97316">Ajustado</Badge>}
                              </Td>
                              <Td $muted>{p.startMonth}{!isSingle && ` → ${p.endMonth ?? '∞'}`}</Td>
                              <Td>{p.paidBy && <Badge>{getPersonName(p.paidBy)}</Badge>}</Td>
                              <Td $align="right">
                                <MoneyValue value={displayValue} />
                                {hasOverride && (
                                  <div style={{ fontSize: '0.625rem', textDecoration: 'line-through', opacity: 0.5 }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amountPerMonth)}
                                  </div>
                                )}
                              </Td>
                              <Td $align="right">
                                <Flex $gap={1} $justify="flex-end">
                                  {active && (
                                    <IconButton title={`Ajustar em ${formatMonthLabel(selectedMonth)}`}
                                      onClick={() => setOverrideModal({ cardId: card.id, purchase: p })}>
                                      <CalendarDays size={13} style={{ color: '#f97316' }} />
                                    </IconButton>
                                  )}
                                  <IconButton onClick={() => setPurchaseModal({ cardId: card.id, purchase: p })}>
                                    <Pencil size={13} />
                                  </IconButton>
                                  <IconButton $danger onClick={() => { if (confirm('Excluir esta compra?')) deletePurchase(card.id, p.id) }}>
                                    <Trash2 size={13} />
                                  </IconButton>
                                </Flex>
                              </Td>
                            </Tr>
                          )
                        })}
                    </Tbody>
                  </Table>
                  {card.purchases.length === 0 && (
                    <Muted style={{ display: 'block', textAlign: 'center', padding: '1.5rem' }}>
                      Nenhuma compra cadastrada.
                    </Muted>
                  )}
                </TableWrapper>
              </ExpandedSection>
            )}
          </Card>
        )
      })}

      {/* Card modal */}
      {cardModal !== null && (
        <Modal title={cardModal.card ? 'Editar cartão' : 'Novo cartão'} onClose={() => setCardModal(null)} size="sm">
          <FormRow>
            <Label>Nome do cartão</Label>
            <Input
              defaultValue={cardModal.card?.name}
              value={cardModal.card ? undefined : newCardName}
              onChange={e => cardModal.card
                ? setCardModal({ card: { ...cardModal.card, name: e.target.value } })
                : setNewCardName(e.target.value)}
              placeholder="Ex: Nubank" autoFocus
            />
          </FormRow>
          <FormRow>
            <Label>Dia de vencimento</Label>
            <Input type="number" min={1} max={31}
              value={cardModal.card ? cardModal.card.dueDay : newCardDay}
              onChange={e => {
                const v = Number.parseInt(e.target.value)
                cardModal.card ? setCardModal({ card: { ...cardModal.card, dueDay: v } }) : setNewCardDay(v)
              }}
            />
          </FormRow>
          <Flex $justify="flex-end" $gap={2}>
            <GhostButton onClick={() => setCardModal(null)}>Cancelar</GhostButton>
            <PrimaryButton onClick={() => {
              if (cardModal.card) updateCard(cardModal.card.id, { name: cardModal.card.name, dueDay: cardModal.card.dueDay })
              else if (newCardName.trim()) addCard({ name: newCardName.trim(), dueDay: newCardDay })
              setCardModal(null); setNewCardName('')
            }}>Salvar</PrimaryButton>
          </Flex>
        </Modal>
      )}

      {/* Override modal — ajustar valor em 1 mês específico */}
      {overrideModal && (
        <Modal
          title={`Ajustar "${overrideModal.purchase.name}" em ${formatMonthLabel(selectedMonth)}`}
          onClose={() => setOverrideModal(null)} size="sm"
        >
          <Alert $variant="info" style={{ fontSize: '0.75rem' }}>
            Afeta APENAS {formatMonthLabel(selectedMonth)}. Os outros meses continuam com o valor base.
          </Alert>
          <FormRow>
            <Label>Valor em {formatMonthLabel(selectedMonth)} (R$)</Label>
            <Input
              type="number" step="0.01" min="0" autoFocus
              defaultValue={overrideModal.purchase.overrides?.[selectedMonth] ?? overrideModal.purchase.amountPerMonth}
              id="override-input"
            />
          </FormRow>
          <Muted $size="xs">Valor base: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overrideModal.purchase.amountPerMonth)}</Muted>
          <Flex $justify="space-between" $align="center">
            {overrideModal.purchase.overrides?.[selectedMonth] !== undefined && (
              <DangerButton onClick={() => {
                setPurchaseOverride(overrideModal.cardId, overrideModal.purchase.id, selectedMonth, null)
                setOverrideModal(null)
              }}>Remover ajuste</DangerButton>
            )}
            <Flex $gap={2} style={{ marginLeft: 'auto' }}>
              <GhostButton onClick={() => setOverrideModal(null)}>Cancelar</GhostButton>
              <PrimaryButton onClick={() => {
                const input = document.getElementById('override-input') as HTMLInputElement
                const val = Number.parseFloat(input.value)
                if (!Number.isNaN(val)) {
                  setPurchaseOverride(overrideModal.cardId, overrideModal.purchase.id, selectedMonth,
                    val === overrideModal.purchase.amountPerMonth ? null : val)
                }
                setOverrideModal(null)
              }}>Salvar</PrimaryButton>
            </Flex>
          </Flex>
        </Modal>
      )}

      {/* Purchase modal */}
      {purchaseModal && (
        <PurchaseModal
          cardId={purchaseModal.cardId}
          initial={purchaseModal.purchase}
          selectedMonth={selectedMonth}
          onSave={data => {
            purchaseModal.purchase
              ? updatePurchase(purchaseModal.cardId, purchaseModal.purchase.id, data)
              : addPurchase(purchaseModal.cardId, data)
            setPurchaseModal(null)
          }}
          onClose={() => setPurchaseModal(null)}
        />
      )}
    </Flex>
  )
}
