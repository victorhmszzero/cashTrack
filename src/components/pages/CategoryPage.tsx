// src/components/pages/CategoryPage.tsx
import { useState } from 'react'
import styled from 'styled-components'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { MoneyValue } from '../shared/MoneyValue'
import { Modal } from '../shared/Modal'
import { isActiveInMonth } from '@/utils/calculations'
import {
  Card, Flex, PageTitle, Muted, SectionTitle,
  PrimaryButton, GhostButton, DangerButton, IconButton,
  Table, Thead, Tbody, Th, Td, Tr, TableWrapper,
  FormRow, Label, Input, ProgressTrack, ProgressFill,
} from '@/styles/ui'

const EMOJI_OPTIONS = ['🏠','🍔','🏥','🎉','👕','💼','📚','🚗','💊','✈️','🎮','💰','🐾','🎵','🛒']
const COLOR_OPTIONS  = ['#3b82f6','#f97316','#10b981','#8b5cf6','#ec4899','#eab308','#64748b','#ef4444','#06b6d4','#84cc16']

const ColorDot = styled.div<{ $color: string; $selected?: boolean }>`
  width: 1.5rem; height: 1.5rem; border-radius: 50%;
  background: ${p => p.$color}; cursor: pointer; flex-shrink: 0;
  border: 2px solid ${p => p.$selected ? 'white' : 'transparent'};
  outline: ${p => p.$selected ? `2px solid ${p.$color}` : 'none'};
  transition: transform 0.12s;
  &:hover { transform: scale(1.15); }
`

const EmojiBtn = styled.button<{ $selected: boolean }>`
  font-size: 1.25rem; width: 2.2rem; height: 2.2rem;
  border-radius: ${p => p.theme.radius.sm};
  border: 2px solid ${p => p.$selected ? p.theme.accent : p.theme.border};
  background: ${p => p.$selected ? p.theme.accentSoft : 'transparent'};
  cursor: pointer; display: flex; align-items: center; justify-content: center;
`

const CategoryHeader = styled.button`
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border: none; background: transparent;
  cursor: pointer; font-family: ${p => p.theme.font.sans}; transition: background 0.12s;
  &:hover { background: ${p => p.theme.bg.hover}; }
`

const BulletDot = styled.span<{ $color: string }>`
  display: inline-block; width: 8px; height: 8px;
  border-radius: 50%; background: ${p => p.$color}; flex-shrink: 0;
`

interface Props { selectedMonth: string }

export function CategoryPage({ selectedMonth }: Props) {
  const { categories, cards, fixedBills, addCategory, updateCategory, deleteCategory } = useStore()
  const cats = categories ?? []

  const [expanded, setExpanded] = useState<string | null>(null)
  const [modal, setModal] = useState<{ cat?: typeof cats[0] } | null>(null)
  const [form, setForm] = useState({ name: '', emoji: '🏠', color: '#3b82f6' })

  // Calcula total de cada categoria no mês selecionado
  const getCatTotal = (catId: string) => {
    let total = 0
    for (const card of cards)
      for (const p of card.purchases)
        if (p.categoryId === catId && isActiveInMonth(p.startMonth, p.endMonth, selectedMonth))
          total += p.overrides?.[selectedMonth] ?? p.amountPerMonth
    for (const bill of fixedBills)
      if (bill.categoryId === catId && bill.active)
        total += bill.overrides?.[selectedMonth] ?? bill.amount
    return total
  }

  // Compras vinculadas a uma categoria
  const getLinkedItems = (catId: string) => {
    const items: { label: string; sub: string; value: number; active: boolean }[] = []
    for (const card of cards)
      for (const p of card.purchases)
        if (p.categoryId === catId)
          items.push({
            label: p.name, sub: card.name,
            value: p.overrides?.[selectedMonth] ?? p.amountPerMonth,
            active: isActiveInMonth(p.startMonth, p.endMonth, selectedMonth),
          })
    for (const bill of fixedBills)
      if (bill.categoryId === catId)
        items.push({
          label: bill.name, sub: 'Conta fixa',
          value: bill.overrides?.[selectedMonth] ?? bill.amount,
          active: bill.active,
        })
    return items
  }

  const grandTotal = cats.reduce((s, c) => s + getCatTotal(c.id), 0)

  const openNew = () => { setForm({ name: '', emoji: '🏠', color: '#3b82f6' }); setModal({}) }
  const openEdit = (cat: typeof cats[0]) => { setForm({ name: cat.name, emoji: cat.emoji, color: cat.color }); setModal({ cat }) }

  const save = () => {
    if (!form.name.trim()) return
    if (modal?.cat) updateCategory(modal.cat.id, form)
    else addCategory(form)
    setModal(null)
  }

  return (
    <Flex $col $gap={4}>
      <Flex $align="center" $justify="space-between">
        <div>
          <PageTitle>Categorias</PageTitle>
          <Muted $size="xs">Total categorizado este mês: <MoneyValue value={grandTotal} /></Muted>
        </div>
        <PrimaryButton onClick={openNew}><Plus size={15} /> Nova categoria</PrimaryButton>
      </Flex>

      {/* Resumo visual */}
      {cats.length > 0 && (
        <Card>
          <div style={{ padding: '1.25rem' }}>
            <SectionTitle style={{ marginBottom: '1rem' }}>Distribuição de gastos</SectionTitle>
            <Flex $col $gap={3}>
              {cats.map(cat => {
                const total = getCatTotal(cat.id)
                const pct   = grandTotal > 0 ? (total / grandTotal) * 100 : 0
                return total > 0 ? (
                  <div key={cat.id}>
                    <Flex $justify="space-between" $align="center" style={{ marginBottom: '0.3rem' }}>
                      <Flex $align="center" $gap={2}>
                        <span>{cat.emoji}</span>
                        <Muted $size="xs" style={{ fontWeight: 600 }}>{cat.name}</Muted>
                        <Muted $size="xs">({pct.toFixed(0)}%)</Muted>
                      </Flex>
                      <MoneyValue value={total} />
                    </Flex>
                    <ProgressTrack>
                      <ProgressFill $pct={pct} $color={cat.color} />
                    </ProgressTrack>
                  </div>
                ) : null
              })}
            </Flex>
          </div>
        </Card>
      )}

      {/* Lista de categorias */}
      {cats.map(cat => {
        const total = getCatTotal(cat.id)
        const items = getLinkedItems(cat.id)
        const isExp = expanded === cat.id

        return (
          <Card key={cat.id}>
            <CategoryHeader onClick={() => setExpanded(prev => prev === cat.id ? null : cat.id)}>
              <Flex $align="center" $gap={3}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{cat.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <Flex $align="center" $gap={2}>
                    <BulletDot $color={cat.color} />
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{cat.name}</p>
                  </Flex>
                  <Muted $size="xs">{items.length} item(s) vinculado(s)</Muted>
                </div>
              </Flex>
              <Flex $align="center" $gap={3}>
                <MoneyValue value={total} />
                {isExp ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Flex>
            </CategoryHeader>

            {isExp && (
              <div style={{ borderTop: `1px solid` }}>
                <Flex $align="center" $justify="space-between" style={{ padding: '0.625rem 1rem', background: 'rgba(0,0,0,0.02)' }}>
                  <Muted $size="xs">{items.length} item(s)</Muted>
                  <Flex $gap={2}>
                    <GhostButton onClick={() => openEdit(cat)}><Pencil size={13} /> Editar</GhostButton>
                    <DangerButton onClick={() => { if (confirm(`Excluir categoria "${cat.name}"? As compras não serão apagadas.`)) deleteCategory(cat.id) }}>
                      <Trash2 size={13} />
                    </DangerButton>
                  </Flex>
                </Flex>
                {items.length > 0 ? (
                  <TableWrapper>
                    <Table>
                      <Thead>
                        <Tr><Th>Item</Th><Th>Origem</Th><Th $align="right">Valor/mês</Th></Tr>
                      </Thead>
                      <Tbody>
                        {items.map((item, i) => (
                          <Tr key={i} $faded={!item.active}>
                            <Td style={{ fontWeight: 500 }}>{item.label}</Td>
                            <Td $muted>{item.sub}</Td>
                            <Td $align="right"><MoneyValue value={item.value} /></Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableWrapper>
                ) : (
                  <Muted style={{ display: 'block', textAlign: 'center', padding: '1.5rem' }}>
                    Nenhum item vinculado ainda. Edite uma compra ou conta fixa e selecione esta categoria.
                  </Muted>
                )}
              </div>
            )}
          </Card>
        )
      })}

      {cats.length === 0 && (
        <Card>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏷️</p>
            <Muted>Nenhuma categoria ainda. Crie categorias e vincule às suas compras para ver o breakdown de gastos.</Muted>
          </div>
        </Card>
      )}

      {/* Modal criar/editar */}
      {modal !== null && (
        <Modal title={modal.cat ? 'Editar categoria' : 'Nova categoria'} onClose={() => setModal(null)} size="sm">
          <FormRow>
            <Label>Nome</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Alimentação" autoFocus />
          </FormRow>

          <FormRow>
            <Label>Emoji</Label>
            <Flex $wrap $gap={1}>
              {EMOJI_OPTIONS.map(e => (
                <EmojiBtn key={e} $selected={form.emoji === e} onClick={() => setForm(f => ({ ...f, emoji: e }))}>
                  {e}
                </EmojiBtn>
              ))}
            </Flex>
          </FormRow>

          <FormRow>
            <Label>Cor</Label>
            <Flex $wrap $gap={2} style={{ marginTop: '0.25rem' }}>
              {COLOR_OPTIONS.map(c => (
                <ColorDot key={c} $color={c} $selected={form.color === c} onClick={() => setForm(f => ({ ...f, color: c }))} />
              ))}
            </Flex>
          </FormRow>

          <Flex $justify="flex-end" $gap={2}>
            <GhostButton onClick={() => setModal(null)}>Cancelar</GhostButton>
            <PrimaryButton onClick={save} disabled={!form.name.trim()}>Salvar</PrimaryButton>
          </Flex>
        </Modal>
      )}
    </Flex>
  )
}
