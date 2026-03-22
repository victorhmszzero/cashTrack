// src/components/modals/PixItemModal.tsx

import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { PixItem } from '../../types'

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
    setForm((f) => ({ ...f, [key]: val }))

  const submit = () => {
    if (!form.description.trim() || form.amountPerMonth <= 0) return
    onSave({ ...form, endMonth: isRecurrent ? null : form.endMonth })
  }

  return (
    <Modal
      title={`${initial ? 'Editar' : 'Novo'} item — ${personName}`}
      onClose={onClose}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="label">Descrição</label>
          <input
            className="input"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Ex: Academia Itaú"
          />
        </div>

        <div>
          <label className="label">Valor por mês (R$)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={form.amountPerMonth || ''}
            onChange={(e) => set('amountPerMonth', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Mês início</label>
            <input
              className="input"
              type="month"
              value={form.startMonth}
              onChange={(e) => set('startMonth', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Mês fim</label>
            <input
              className="input"
              type="month"
              value={form.endMonth || ''}
              disabled={isRecurrent}
              onChange={(e) => set('endMonth', e.target.value || null)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurrent}
            onChange={(e) => {
              setIsRecurrent(e.target.checked)
              if (e.target.checked) set('endMonth', null)
            }}
            className="w-4 h-4 accent-blue-500"
          />
          <span className="text-sm text-slate-300">Recorrente (sem prazo de fim)</span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={submit}>Salvar</button>
        </div>
      </div>
    </Modal>
  )
}
