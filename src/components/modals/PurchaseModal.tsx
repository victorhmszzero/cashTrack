// src\components\modals\PurchaseModal.tsx
import { useState } from 'react'

import { useStore } from '@/store/useStore'
import * as Ui from '@/styles/ui'
import type { Purchase } from '@/types'

import { Modal } from '../shared/Modal'

type FormData = Omit<Purchase, 'id'>

interface Props {
  cardId: string
  initial?: Purchase
  selectedMonth: string
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
      <Ui.FormRow>
        <Ui.Label>Nome da compra</Ui.Label>
        <Ui.Input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Ex: Tênis Casas Bahia"
          autoFocus
        />
      </Ui.FormRow>

      <Ui.FormRow>
        <Ui.Label>Valor por mês (R$)</Ui.Label>
        <Ui.Input
          type="number" step="0.01" min="0"
          value={form.amountPerMonth || ''}
          onChange={e => set('amountPerMonth', Number.parseFloat(e.target.value) || 0)}
          placeholder="0,00"
        />
      </Ui.FormRow>
        
        <Ui.FormRow>
          <Ui.Label>Observações (Opcional)</Ui.Label>
          <Ui.Input
            value={form.notes || ''}
            onChange={e => set('notes', e.target.value)}
            placeholder="Ex: Loja X"
          />
        </Ui.FormRow>

      <Ui.FormGrid>
        <Ui.FormRow>
          <Ui.Label>Mês início</Ui.Label>
          <Ui.Input type="month" value={form.startMonth} onChange={e => set('startMonth', e.target.value)} />
        </Ui.FormRow>
        <Ui.FormRow>
          <Ui.Label>Mês fim</Ui.Label>
          <Ui.Input
            type="month"
            value={form.endMonth || ''}
            disabled={isRecurrent}
            onChange={e => set('endMonth', e.target.value || null)}
          />
        </Ui.FormRow>
      </Ui.FormGrid>

      {/* Quando início = fim, avisa que é compra única */}
      {isSingleMonth && (
        <Ui.Alert $variant="info" style={{ fontSize: '0.75rem' }}>
          💡 Compra única em {form.startMonth} — aparece só nessa fatura.
        </Ui.Alert>
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

      <Ui.FormGrid>
        <Ui.FormRow>
          <Ui.Label>Categoria</Ui.Label>
          <Ui.Select value={form.categoryId || ''} onChange={e => set('categoryId', e.target.value)}>
            <option value="">Sem categoria</option>
            {(categories ?? []).map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </Ui.Select>
        </Ui.FormRow>
        <Ui.FormRow>
          <Ui.Label>Quem vai pagar? (PIX)</Ui.Label>
          <Ui.Select value={form.paidBy || ''} onChange={e => set('paidBy', e.target.value)}>
            <option value="">Ninguém (meu gasto)</option>
            {pixPeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Ui.Select>
        </Ui.FormRow>
      </Ui.FormGrid>

      {/* <FormGrid> */}
        <Ui.FormRow>
          <Ui.Label>Data da compra (opcional)</Ui.Label>
          <Ui.Input
            type="date"
            value={form.purchaseDate || ''}
            onChange={e => set('purchaseDate', e.target.value)}
          />
        </Ui.FormRow>

      {/* </FormGrid> */}

      <Ui.Flex $justify="flex-end" $gap={2}>
        <Ui.GhostButton onClick={onClose}>Cancelar</Ui.GhostButton>
        <Ui.PrimaryButton onClick={submit} disabled={!isValid}>Salvar</Ui.PrimaryButton>
      </Ui.Flex>
    </Modal>
  )
}
