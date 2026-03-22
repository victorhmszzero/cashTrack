// src/components/pages/CardsPage.tsx

import { useState } from 'react'
import { Plus, Pencil, Trash2, CreditCard, ChevronDown, ChevronRight } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { MoneyValue } from '../shared/MoneyValue'
import { PurchaseModal } from '../modals/PurchaseModal'
import { Modal } from '../shared/Modal'
import { isActiveInMonth, getCurrentInstallment } from '../../utils/calculations'
import { CreditCard as CardType, Purchase } from '../../types'

interface Props {
  selectedMonth: string
}

export function CardsPage({ selectedMonth }: Props) {
const { cards, pixPeople, addCard, updateCard, deleteCard, addPurchase, updatePurchase, deletePurchase } = useStore()

  const [expandedCard, setExpandedCard] = useState<string | null>(cards[0]?.id ?? null)
  const [purchaseModal, setPurchaseModal] = useState<{
    cardId: string
    purchase?: Purchase
  } | null>(null)
  const [cardModal, setCardModal] = useState<{ card?: CardType } | null>(null)
  const [newCardName, setNewCardName] = useState('')
  const [newCardDay, setNewCardDay] = useState(10)

  const [sortKey, setSortKey] = useState<'name' | 'period' | 'paidBy' | 'amount'>('period')
  const [sortDesc, setSortDesc] = useState(false)

  const handleSort = (key: 'name' | 'period' | 'paidBy' | 'amount') => {
    if (sortKey === key) setSortDesc(!sortDesc)
    else { setSortKey(key); setSortDesc(false) }
  }

  const getPersonName = (id: string) => {
    const p = pixPeople.find(pp => pp.id === id || pp.name === id)
    return p ? p.name : id
  }


  const toggle = (id: string) => setExpandedCard((prev) => (prev === id ? null : id))

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-200">Cartões de Crédito</h2>
        <button className="btn-primary" onClick={() => setCardModal({})}>
          <Plus size={15} /> Novo cartão
        </button>
      </div>

      {cards.map((card) => {
        const activeTotal = card.purchases
          .filter((p) => isActiveInMonth(p.startMonth, p.endMonth, selectedMonth))
          .reduce((s, p) => s + p.amountPerMonth, 0)

        const expanded = expandedCard === card.id

        return (
          <div key={card.id} className="card overflow-hidden">
            {/* Card header */}
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-surface-700/50 transition-colors"
              onClick={() => toggle(card.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-600 flex items-center justify-center">
                  <CreditCard size={15} className="text-accent-blue" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-200">{card.name}</p>
                  <p className="text-xs text-slate-500">Vence dia {card.dueDay}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MoneyValue value={activeTotal} />
                {expanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
              </div>
            </button>

            {/* Purchases list */}
            {expanded && (
              <div className="border-t border-surface-600">
                <div className="p-3 flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    {card.purchases.length} compra(s)
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn-ghost text-xs py-1"
                      onClick={() => setCardModal({ card })}
                    >
                      <Pencil size={13} /> Editar
                    </button>
                    <button
                      className="btn-danger text-xs py-1"
                      onClick={() => {
                        if (confirm(`Excluir cartão ${card.name}?`)) deleteCard(card.id)
                      }}
                    >
                      <Trash2 size={13} /> Excluir
                    </button>
                    <button
                      className="btn-primary text-xs py-1"
                      onClick={() => setPurchaseModal({ cardId: card.id })}
                    >
                      <Plus size={13} /> Compra
                    </button>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-surface-600 select-none">
                      <th className="text-left px-4 py-2 font-bold cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('name')}>
                        Nome {sortKey === 'name' ? (sortDesc ? '▼' : '▲') : ''}
                      </th>
                      <th className="text-left px-4 py-2 font-bold hidden sm:table-cell cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('period')}>
                        Período {sortKey === 'period' ? (sortDesc ? '▼' : '▲') : ''}
                      </th>
                      <th className="text-left px-4 py-2 font-bold hidden sm:table-cell cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('paidBy')}>
                        Pago por {sortKey === 'paidBy' ? (sortDesc ? '▼' : '▲') : ''}
                      </th>
                      <th className="text-right px-4 py-2 font-bold cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('amount')}>
                        Valor/mês {sortKey === 'amount' ? (sortDesc ? '▼' : '▲') : ''}
                      </th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...card.purchases]
                      .sort((a, b) => {
                        let valA: any, valB: any;
                        if (sortKey === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
                        else if (sortKey === 'paidBy') { valA = getPersonName(a.paidBy || '').toLowerCase(); valB = getPersonName(b.paidBy || '').toLowerCase(); }
                        else if (sortKey === 'amount') { valA = a.amountPerMonth; valB = b.amountPerMonth; }
                        else { valA = a.startMonth; valB = b.startMonth; } // period

                        if (valA < valB) return sortDesc ? 1 : -1;
                        if (valA > valB) return sortDesc ? -1 : 1;
                        return 0;
                      })
                      .map((p) => {
                      const active = isActiveInMonth(p.startMonth, p.endMonth, selectedMonth)
                      const installNum = getCurrentInstallment(p.startMonth, selectedMonth)
                      const totalInstall = p.endMonth ? getCurrentInstallment(p.startMonth, p.endMonth) : null

                      return (
                        <tr key={p.id} className={`border-b border-surface-600 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!active ? 'opacity-40' : ''}`}>
                          <td className="px-4 py-2.5">
                            <div>
                              <p className="font-medium text-sm">{p.name}</p>
                              {totalInstall && active && <p className="text-[10px] uppercase font-bold text-slate-500">Parcela {installNum}/{totalInstall}</p>}
                              {!p.endMonth && active && <p className="text-[10px] uppercase font-bold text-emerald-600">Recorrente</p>}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell text-xs text-slate-500">
                            {p.startMonth} → {p.endMonth ?? '∞'}
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            {p.paidBy ? (
                              <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-surface-600 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md shadow-sm">
                                {getPersonName(p.paidBy)}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-2.5 text-right"><MoneyValue value={p.amountPerMonth} /></td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1 justify-end">
                              <button className="btn-ghost p-1" onClick={() => setPurchaseModal({ cardId: card.id, purchase: p })}><Pencil size={13} /></button>
                              <button className="btn-danger p-1" onClick={() => { if (confirm('Excluir esta compra?')) deletePurchase(card.id, p.id) }}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>


                {card.purchases.length === 0 && (
                  <p className="text-center text-slate-600 text-sm py-6">Nenhuma compra cadastrada.</p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Card modal */}
      {cardModal !== null && (
        <Modal
          title={cardModal.card ? 'Editar cartão' : 'Novo cartão'}
          onClose={() => setCardModal(null)}
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Nome do cartão</label>
              <input
                className="input"
                value={cardModal.card ? undefined : newCardName}
                defaultValue={cardModal.card?.name}
                onChange={(e) => {
                  if (cardModal.card) {
                    setCardModal({ card: { ...cardModal.card, name: e.target.value } })
                  } else {
                    setNewCardName(e.target.value)
                  }
                }}
                placeholder="Ex: Nubank"
              />
            </div>
            <div>
              <label className="label">Dia de vencimento</label>
              <input
                className="input"
                type="number"
                min={1}
                max={31}
                value={cardModal.card ? cardModal.card.dueDay : newCardDay}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  if (cardModal.card) {
                    setCardModal({ card: { ...cardModal.card, dueDay: v } })
                  } else {
                    setNewCardDay(v)
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setCardModal(null)}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (cardModal.card) {
                    updateCard(cardModal.card.id, {
                      name: cardModal.card.name,
                      dueDay: cardModal.card.dueDay,
                    })
                  } else {
                    if (newCardName.trim()) {
                      addCard({ name: newCardName.trim(), dueDay: newCardDay })
                    }
                  }
                  setCardModal(null)
                  setNewCardName('')
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Purchase modal */}
      {purchaseModal && (
        <PurchaseModal
          cardId={purchaseModal.cardId}
          initial={purchaseModal.purchase}
          onSave={(data) => {
            if (purchaseModal.purchase) {
              updatePurchase(purchaseModal.cardId, purchaseModal.purchase.id, data)
            } else {
              addPurchase(purchaseModal.cardId, data)
            }
            setPurchaseModal(null)
          }}
          onClose={() => setPurchaseModal(null)}
        />
      )}
    </div>
  )
}
