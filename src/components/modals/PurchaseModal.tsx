// src/components/modals/PurchaseModal.tsx
import React, { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Purchase } from '@/types'
import { useStore } from '@/store/useStore'
import { Flex, FormRow, FormGrid, Label, Input, Select, PrimaryButton, GhostButton, Alert } from '@/styles/ui'

type FormData = Omit<Purchase, 'id'>

interface Props {
  cardId: string
  initial?: Purchase
  selectedMonth: string   // mês selecionado na tela — vira o default
  onSave: (data: FormData) => void
  onClose: () => void
}

export function PurchaseModal({ initial, selectedMonth, onSave, onClose }: Props) {
  const { pixPeople, categories } = useStore()

  const initialPaidBy = initial?.paidBy
    ? (pixPeople.find(p => p.id === initial.paidBy || p.name === initial.paidBy)?.id || '')
    : ''

  // Default: usa o mês selecionado na tela
  const defaultStart = initial?.startMonth ?? selectedMonth
  const defaultEnd   = initial?.endMonth   ?? selectedMonth

  const [form, setForm] = useState<FormData>(
    initial
      ? { ...initial, paidBy: initialPaidBy }
      : { name: '', amountPerMonth: 0, startMonth: defaultStart, endMonth: defaultEnd, paidBy: '', notes: '', categoryId: '', purchaseDate: '' }
  )
  const [isRecurrent, setIsRecurrent] = useState(initial ? !initial.endMonth : false)

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const isSingleMonth = !isRecurrent && form.startMonth === form.endMonth
  const isValid = form.name.trim().length > 0 && form.amountPerMonth > 0

  const submit = () => {
    if (!isValid) return
    onSave({ ...form, endMonth: isRecurrent ? null : form.endMonth })
  }

  return (
    <Modal title={initial ? 'Editar compra' : 'Nova compra'} onClose={onClose} size="md">
      <FormRow>
        <Label>Nome da compra</Label>
        <Input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Ex: Tênis Casas Bahia"
          autoFocus
        />
      </FormRow>

      <FormRow>
        <Label>Valor por mês (R$)</Label>
        <Input
          type="number" step="0.01" min="0"
          value={form.amountPerMonth || ''}
          onChange={e => set('amountPerMonth', parseFloat(e.target.value) || 0)}
          placeholder="0,00"
        />
      </FormRow>
        
        <FormRow>
          <Label>Observações (Opcional)</Label>
          <Input
            value={form.notes || ''}
            onChange={e => set('notes', e.target.value)}
            placeholder="Ex: Loja X"
          />
        </FormRow>

      <FormGrid>
        <FormRow>
          <Label>Mês início</Label>
          <Input type="month" value={form.startMonth} onChange={e => set('startMonth', e.target.value)} />
        </FormRow>
        <FormRow>
          <Label>Mês fim</Label>
          <Input
            type="month"
            value={form.endMonth || ''}
            disabled={isRecurrent}
            onChange={e => set('endMonth', e.target.value || null)}
          />
        </FormRow>
      </FormGrid>

      {/* Quando início = fim, avisa que é compra única */}
      {isSingleMonth && (
        <Alert $variant="info" style={{ fontSize: '0.75rem' }}>
          💡 Compra única em {form.startMonth} — aparece só nessa fatura.
        </Alert>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={isRecurrent}
          onChange={e => {
            setIsRecurrent(e.target.checked)
            if (e.target.checked) set('endMonth', null)
          }}
        />
        <span style={{ fontSize: '0.875rem' }}>Recorrente (sem prazo de fim)</span>
      </label>

      <FormGrid>
        <FormRow>
          <Label>Categoria</Label>
          <Select value={form.categoryId || ''} onChange={e => set('categoryId', e.target.value)}>
            <option value="">Sem categoria</option>
            {(categories ?? []).map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </Select>
        </FormRow>
        <FormRow>
          <Label>Quem vai pagar? (PIX)</Label>
          <Select value={form.paidBy || ''} onChange={e => set('paidBy', e.target.value)}>
            <option value="">Ninguém (meu gasto)</option>
            {pixPeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </FormRow>
      </FormGrid>

      {/* <FormGrid> */}
        <FormRow>
          <Label>Data da compra (opcional)</Label>
          <Input
            type="date"
            value={form.purchaseDate || ''}
            onChange={e => set('purchaseDate', e.target.value)}
          />
        </FormRow>

      {/* </FormGrid> */}

      <Flex $justify="flex-end" $gap={2}>
        <GhostButton onClick={onClose}>Cancelar</GhostButton>
        <PrimaryButton onClick={submit} disabled={!isValid}>Salvar</PrimaryButton>
      </Flex>
    </Modal>
  )
}
