// src/components/modals/PurchaseModal.tsx

import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Purchase } from '../../types'
import { useStore } from '../../store/useStore'

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
  endMonth: null,
  paidBy: '',
  notes: '',
}

export function PurchaseModal({ initial, onSave, onClose }: Props) {
  const { pixPeople } = useStore()

  // Mapear compatibilidade de dados antigos (nome) para ID novo
  const initialPaidBy = initial?.paidBy 
    ? (pixPeople.find(p => p.id === initial.paidBy || p.name === initial.paidBy)?.id || '') 
    : ''

  const [form, setForm] = useState<FormData>(initial ? { ...initial, paidBy: initialPaidBy } : { ...EMPTY })
  const [isRecurrent, setIsRecurrent] = useState(!initial?.endMonth)

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const submit = () => {
    if (!form.name.trim() || form.amountPerMonth <= 0) return
    onSave({ ...form, endMonth: isRecurrent ? null : form.endMonth })
  }

  return (
    <Modal title={initial ? 'Editar compra' : 'Nova compra'} onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        <div>
          <label className="label">Nome da compra</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ex: Tênis Casas Bahia"
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
            placeholder="0,00"
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
            style={{ accentColor: 'var(--accent)' }}
          />
          <span className="text-sm text-slate-500 font-medium">Recorrente (sem prazo de fim)</span>
        </label>

        <div>
          <label className="label">Quem vai pagar? (PIX)</label>
          <select
            className="input"
            value={form.paidBy || ''}
            onChange={(e) => set('paidBy', e.target.value)}
          >
            <option value="">Ninguém (Meu próprio gasto)</option>
            {pixPeople.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Observações</label>
          <input
            className="input"
            value={form.notes || ''}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={submit}>
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  )
}