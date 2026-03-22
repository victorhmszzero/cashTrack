import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { PixItem } from '@/types'
import { Flex, FormRow, FormGrid, Label, Input, PrimaryButton, GhostButton } from '@/styles/ui'

type FormData = Omit<PixItem, 'id'>

interface Props {
  personName: string
  initial?: PixItem
  onSave: (data: FormData) => void
  onClose: () => void
}

const EMPTY: FormData = {
  description: '',
  amountPerMonth: 0,
  startMonth: new Date().toISOString().slice(0, 7),
  endMonth: null,
}

export function PixItemModal({ personName, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormData>(initial ? { ...initial } : { ...EMPTY })
  const [isRecurrent, setIsRecurrent] = useState(!initial?.endMonth)

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const submit = () => {
    if (!form.description.trim() || form.amountPerMonth <= 0) return
    onSave({ ...form, endMonth: isRecurrent ? null : form.endMonth })
  }

  return (
    <Modal title={`${initial ? 'Editar' : 'Novo'} item — ${personName}`} onClose={onClose} size="sm">
      <FormRow>
        <Label>Descrição</Label>
        <Input
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Ex: Academia Itaú"
          autoFocus
        />
      </FormRow>

      <FormRow>
        <Label>Valor por mês (R$)</Label>
        <Input
          type="number" step="0.01" min="0"
          value={form.amountPerMonth || ''}
          onChange={e => set('amountPerMonth', parseFloat(e.target.value) || 0)}
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

      <Flex $justify="flex-end" $gap={2}>
        <GhostButton onClick={onClose}>Cancelar</GhostButton>
        <PrimaryButton onClick={submit}>Salvar</PrimaryButton>
      </Flex>
    </Modal>
  )
}
