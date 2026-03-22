import { useState } from 'react'
import styled from 'styled-components'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, CreditCard } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { MoneyValue } from '../shared/MoneyValue'
import { PixItemModal } from '../modals/PixItemModal'
import { isActiveInMonth } from '@/utils/calculations'
import { PixItem, Purchase } from '@/types'
import {
  Card, Flex, PageTitle, Muted, Badge,
  PrimaryButton, SmallPrimaryButton, GhostButton, DangerButton, IconButton,
  Table, Tbody, Th, Td, Tr, TableWrapper, FormRow, Label, Input, Thead,
} from '@/styles/ui'

// ─── Styled ───────────────────────────────────────────────────────────────────

const PersonHeader = styled.button`
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

const Avatar = styled.div<{ $color: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${p => p.$color}22;
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
`

const ExpandedSection = styled.div`
  border-top: 1px solid ${p => p.theme.border};
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  background: ${p => p.theme.bg.hover};
  flex-wrap: wrap;
  gap: 0.5rem;
`

const AccentText = styled.span`
  color: ${p => p.theme.accent};
`

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTE = ['#8b5cf6','#ec4899','#f97316','#06b6d4','#22c55e','#eab308','#ef4444','#3b82f6']

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { selectedMonth: string }

export function PixPage({ selectedMonth }: Props) {
  const { pixPeople, cards, addPixPerson, updatePixPerson, deletePixPerson, addPixItem, updatePixItem, deletePixItem } = useStore()

  const [expanded, setExpanded] = useState<string | null>(pixPeople[0]?.id ?? null)
  const [itemModal, setItemModal] = useState<{ personId: string; personName: string; item?: PixItem } | null>(null)
  const [newPersonName, setNewPersonName] = useState('')
  const [showAddPerson, setShowAddPerson] = useState(false)

  const totalReceivable = pixPeople.reduce((sum, person) => {
    const items = person.items.filter(i => isActiveInMonth(i.startMonth, i.endMonth, selectedMonth))
      .reduce((s, i) => s + i.amountPerMonth, 0)
    const purchases = cards.reduce((cs, card) =>
      cs + card.purchases
        .filter(p => (p.paidBy === person.id || p.paidBy === person.name) && isActiveInMonth(p.startMonth, p.endMonth, selectedMonth))
        .reduce((ps, p) => ps + p.amountPerMonth, 0), 0)
    return sum + items + purchases
  }, 0)

  return (
    <Flex $col $gap={4}>
      <Flex $align="center" $justify="space-between">
        <div>
          <PageTitle>PIX a Receber</PageTitle>
          <Muted $size="xs">Total este mês: </Muted>
          <MoneyValue value={totalReceivable} colored />
        </div>
        <PrimaryButton onClick={() => setShowAddPerson(true)}>
          <Plus size={15} /> Nova pessoa
        </PrimaryButton>
      </Flex>

      {showAddPerson && (
        <Card>
          <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <FormRow>
                <Label>Nome</Label>
                <Input
                  value={newPersonName}
                  onChange={e => setNewPersonName(e.target.value)}
                  placeholder="Nome da pessoa"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newPersonName.trim()) {
                      addPixPerson(newPersonName.trim()); setNewPersonName(''); setShowAddPerson(false)
                    }
                  }}
                />
              </FormRow>
            </div>
            <PrimaryButton onClick={() => {
              if (newPersonName.trim()) { addPixPerson(newPersonName.trim()); setNewPersonName(''); setShowAddPerson(false) }
            }}>Adicionar</PrimaryButton>
            <GhostButton onClick={() => setShowAddPerson(false)}>Cancelar</GhostButton>
          </div>
        </Card>
      )}

      {pixPeople.map((person, personIdx) => {
        const color = PALETTE[personIdx % PALETTE.length]
        const activeItems = person.items.filter(i => isActiveInMonth(i.startMonth, i.endMonth, selectedMonth))
        const linkedPurchases: (Purchase & { cardName: string })[] = []
        cards.forEach(card => card.purchases.forEach(p => {
          if (p.paidBy === person.id || p.paidBy === person.name)
            linkedPurchases.push({ ...p, cardName: card.name })
        }))
        const activeLinked = linkedPurchases.filter(p => isActiveInMonth(p.startMonth, p.endMonth, selectedMonth))
        const monthTotal = activeItems.reduce((s, i) => s + i.amountPerMonth, 0)
                         + activeLinked.reduce((s, p) => s + p.amountPerMonth, 0)
        const isExp = expanded === person.id

        return (
          <Card key={person.id}>
            <PersonHeader onClick={() => setExpanded(prev => prev === person.id ? null : person.id)}>
              <Flex $align="center" $gap={3}>
                <Avatar $color={color}>{person.name[0]}</Avatar>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0, textAlign: 'left' }}>{person.name}</p>
                  <Muted $size="xs">{activeItems.length + activeLinked.length} item(s) ativo(s)</Muted>
                </div>
              </Flex>
              <Flex $align="center" $gap={3}>
                <MoneyValue value={monthTotal} colored size="md" />
                {isExp ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Flex>
            </PersonHeader>

            {isExp && (
              <ExpandedSection>
                <Toolbar>
                  <Muted $size="xs">{person.items.length} avulso(s) · {linkedPurchases.length} no cartão</Muted>
                  <Flex $gap={2}>
                    <GhostButton onClick={() => { const n = prompt('Novo nome:', person.name); if (n?.trim()) updatePixPerson(person.id, n.trim()) }}>
                      <Pencil size={13} /> Renomear
                    </GhostButton>
                    <DangerButton onClick={() => { if (confirm(`Excluir ${person.name}?`)) deletePixPerson(person.id) }}>
                      <Trash2 size={13} />
                    </DangerButton>
                    <SmallPrimaryButton onClick={() => setItemModal({ personId: person.id, personName: person.name })}>
                      <Plus size={13} /> Item Avulso
                    </SmallPrimaryButton>
                  </Flex>
                </Toolbar>

                <TableWrapper>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Descrição</Th>
                        <Th>Período</Th>
                        <Th $align="right">Valor/mês</Th>
                        <Th />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {linkedPurchases.map(p => (
                        <Tr key={`card-${p.id}`} $faded={!isActiveInMonth(p.startMonth, p.endMonth, selectedMonth)}>
                          <Td>
                            <p style={{ fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>{p.name}</p>
                            <Flex $align="center" $gap={1} style={{ marginTop: '0.15rem' }}>
                              <CreditCard size={10} />
                              <AccentText style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>{p.cardName}</AccentText>
                            </Flex>
                          </Td>
                          <Td $muted>{p.startMonth} → {p.endMonth ?? '∞'}</Td>
                          <Td $align="right"><MoneyValue value={p.amountPerMonth} colored /></Td>
                          <Td $align="right"><Badge>Cartão</Badge></Td>
                        </Tr>
                      ))}

                      {person.items.map(item => (
                        <Tr key={`item-${item.id}`} $faded={!isActiveInMonth(item.startMonth, item.endMonth, selectedMonth)}>
                          <Td>
                            <p style={{ fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>{item.description}</p>
                            {!item.endMonth && <Badge $color="#059669">Recorrente</Badge>}
                          </Td>
                          <Td $muted>{item.startMonth} → {item.endMonth ?? '∞'}</Td>
                          <Td $align="right"><MoneyValue value={item.amountPerMonth} colored /></Td>
                          <Td $align="right">
                            <Flex $gap={1} $justify="flex-end">
                              <IconButton onClick={() => setItemModal({ personId: person.id, personName: person.name, item })}>
                                <Pencil size={13} />
                              </IconButton>
                              <IconButton $danger onClick={() => { if (confirm('Excluir item?')) deletePixItem(person.id, item.id) }}>
                                <Trash2 size={13} />
                              </IconButton>
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {person.items.length === 0 && linkedPurchases.length === 0 && (
                    <Muted style={{ display: 'block', textAlign: 'center', padding: '1.5rem' }}>
                      Nenhum item cadastrado.
                    </Muted>
                  )}
                </TableWrapper>
              </ExpandedSection>
            )}
          </Card>
        )
      })}

      {itemModal && (
        <PixItemModal
          personName={itemModal.personName}
          initial={itemModal.item}
          onSave={data => {
            itemModal.item
              ? updatePixItem(itemModal.personId, itemModal.item.id, data)
              : addPixItem(itemModal.personId, data)
            setItemModal(null)
          }}
          onClose={() => setItemModal(null)}
        />
      )}
    </Flex>
  )
}
