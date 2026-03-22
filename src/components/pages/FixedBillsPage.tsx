// src/components/pages/FixedBillsPage.tsx

import { useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, CalendarDays } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { MoneyValue } from '../shared/MoneyValue'
import { Modal } from '../shared/Modal'
import { formatMonthLabel } from '../../utils/calculations'
import { FixedBill } from '@/types'

interface Props {
  selectedMonth: string
}

export function FixedBillsPage({ selectedMonth }: Props) {
  const { fixedBills, addFixedBill, updateFixedBill, deleteFixedBill, setFixedBillOverride } = useStore()
  const[modal, setModal] = useState<any>(null)

  const total = fixedBills.filter((b) => b.active).reduce((s, b) => s + (b.overrides?.[selectedMonth] ?? b.amount), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Contas Fixas</h2>
          <p className="text-xs text-slate-500 mt-0.5">Total em {formatMonthLabel(selectedMonth)}: <MoneyValue value={total} /></p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ isNew: true })}>
          <Plus size={15} /> Nova conta
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-surface-600">
              <th className="text-left px-4 py-3 font-bold">Nome</th>
              <th className="text-right px-4 py-3 font-bold">Valor Base</th>
              <th className="text-right px-4 py-3 font-bold">Em {formatMonthLabel(selectedMonth)}</th>
              <th className="text-center px-4 py-3 font-bold">Ativo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {fixedBills.map((bill) => {
              const monthOverride = bill.overrides?.[selectedMonth]
              const hasOverride = monthOverride !== undefined

              return (
                <tr key={bill.id} className={`border-b border-surface-600 hover:bg-black/5 transition-colors ${!bill.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{bill.name}</td>
                  <td className="px-4 py-3 text-right text-slate-500 text-xs"><MoneyValue value={bill.amount} /></td>
                  <td className="px-4 py-3 text-right">
                    <MoneyValue value={hasOverride ? monthOverride : bill.amount} className={hasOverride ? 'text-orange-500' : ''} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => updateFixedBill(bill.id, { active: !bill.active })}>
                      {bill.active ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-slate-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button className="btn-ghost p-1" title="Ajustar valor neste mês" onClick={() => setModal({ bill, isOverride: true })}>
                        <CalendarDays size={13} className="text-orange-500" />
                      </button>
                      <button className="btn-ghost p-1" title="Editar conta base" onClick={() => setModal({ bill, isOverride: false })}>
                        <Pencil size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.isNew ? 'Nova conta fixa' : modal.isOverride ? `Ajustar em ${formatMonthLabel(selectedMonth)}` : 'Editar conta'} onClose={() => setModal(null)} size="sm">
          <form className="flex flex-col gap-4" onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const amt = parseFloat(fd.get('amount') as string) || 0
            const name = fd.get('name') as string

            if (modal.isOverride) {
              setFixedBillOverride(modal.bill.id, selectedMonth, amt === modal.bill.amount ? null : amt)
            } else if (modal.isNew) {
              addFixedBill({ name, amount: amt, active: true })
            } else {
              updateFixedBill(modal.bill.id, { name, amount: amt })
            }
            setModal(null)
          }}>
            {!modal.isOverride && (
              <div>
                <label className="label">Nome da Conta</label>
                <input name="name" className="input" defaultValue={modal.bill?.name} required autoFocus />
              </div>
            )}
            <div>
              <label className="label">{modal.isOverride ? `Valor apenas em ${formatMonthLabel(selectedMonth)}` : 'Valor Base Fixo (R$)'}</label>
              <input name="amount" type="number" step="0.01" min="0" className="input" defaultValue={modal.isOverride ? (modal.bill.overrides?.[selectedMonth] ?? modal.bill.amount) : modal.bill?.amount} required autoFocus={modal.isOverride} />
              {modal.isOverride && <p className="text-[10px] text-slate-500 mt-2">Isto afeta APENAS a planilha deste mês. Os outros meses continuarão R$ {modal.bill.amount}.</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {modal.isOverride && modal.bill.overrides?.[selectedMonth] !== undefined && (
                <button type="button" className="btn-ghost mr-auto text-red-500" onClick={() => { setFixedBillOverride(modal.bill.id, selectedMonth, null); setModal(null) }}>
                  Remover ajuste
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="btn-primary">Salvar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}