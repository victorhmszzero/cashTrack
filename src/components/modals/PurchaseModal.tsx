import React, { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Purchase } from '@/types'
import { useStore } from '@/store/useStore'
import { Flex, FormRow, FormGrid, Label, Input, Select, PrimaryButton, GhostButton } from '@/styles/ui'

type FormData = Omit<Purchase, 'id'>

interface Props {
  cardId: string
  initial?: Purchase
  onSave: (data: FormData) => void
  onClose: () => void
}

const EMPTY: FormData = {
  name: '',
  amountPerMonth: 0,
  startMonth: new Date().toISOString().slice(0, 7),
  endMonth: new Date().toISOString().slice(0, 7),
  paidBy: '',
  notes: '',
}

export function PurchaseModal({ initial, onSave, onClose }: Props) {
  const { pixPeople } = useStore()

  const initialPaidBy = initial?.paidBy
    ? (pixPeople.find(p => p.id === initial.paidBy || p.name === initial.paidBy)?.id || '')
    : ''

  const [form, setForm] = useState<FormData>(
    initial ? { ...initial, paidBy: initialPaidBy } : { ...EMPTY }
  )
  const [isRecurrent, setIsRecurrent] = useState(false)
  const [isValid, setIsValid] = useState(false)

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  React.useEffect(()=> {
    if (!form.name.trim() || form.amountPerMonth <= 0) setIsValid(false)
    else setIsValid(true)
  },[form.name, form.amountPerMonth])


  const submit = () => {
    if (!form.name.trim() || form.amountPerMonth <= 0) return
    onSave({ ...form, endMonth: isRecurrent ? null : form.endMonth })
  }

  return (
    <Modal title={initial ? 'Editar compra' : 'Nova compra'} onClose={onClose}  size="md">
      <FormRow> 
        <Label>Nome da compra</Label>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Tênis Casas Bahia" />
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

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={isRecurrent}
          onChange={e => { setIsRecurrent(e.target.checked); if (e.target.checked) set('endMonth', null) }}
        />
        <span style={{ fontSize: '0.875rem' }}>Recorrente (sem prazo de fim)</span>
      </label>

      <FormRow>
        <Label>Quem vai pagar? (PIX)</Label>
        <Select value={form.paidBy || ''} onChange={e => set('paidBy', e.target.value)}>
          <option value="">Ninguém (meu gasto)</option>
          {pixPeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormRow>

      <FormRow>
        <Label>Observações</Label>
        <Input value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Opcional" />
      </FormRow>

      <Flex $justify="flex-end" $gap={2}>
        <GhostButton onClick={onClose}>Cancelar</GhostButton>
        <PrimaryButton onClick={submit} disabled={!isValid}>Salvar</PrimaryButton>
      </Flex>
    </Modal>
  )
}
