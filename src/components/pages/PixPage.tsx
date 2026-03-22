// src/components/pages/PixPage.tsx

import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, CreditCard } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { MoneyValue } from '../shared/MoneyValue'
import { PixItemModal } from '../modals/PixItemModal'
import { isActiveInMonth } from '../../utils/calculations'
import { PixItem, Purchase } from '../../types'

interface Props {
  selectedMonth: string
}

const PERSON_COLORS: Record<string, string> = {
  vovo: 'bg-purple-900/20 text-purple-600 dark:text-purple-300',
  edilaine: 'bg-pink-900/20 text-pink-600 dark:text-pink-300',
  tati: 'bg-orange-900/20 text-orange-600 dark:text-orange-300',
  cris: 'bg-cyan-900/20 text-cyan-600 dark:text-cyan-300',
  juliana: 'bg-green-900/20 text-green-600 dark:text-green-300',
  isaura: 'bg-yellow-900/20 text-yellow-600 dark:text-yellow-300',
  vitu: 'bg-red-900/20 text-red-600 dark:text-red-300',
  marcus: 'bg-blue-900/20 text-blue-600 dark:text-blue-300',
}

export function PixPage({ selectedMonth }: Props) {
  const {
    pixPeople, cards,
    addPixPerson, updatePixPerson, deletePixPerson,
    addPixItem, updatePixItem, deletePixItem,
  } = useStore()

  const [expanded, setExpanded] = useState<string | null>(pixPeople[0]?.id ?? null)
  const [itemModal, setItemModal] = useState<{
    personId: string
    personName: string
    item?: PixItem
  } | null>(null)
  const [newPersonName, setNewPersonName] = useState('')
  const[showAddPerson, setShowAddPerson] = useState(false)

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  const totalReceivable = pixPeople.reduce((sum, person) => {
    const itemsSum = person.items
      .filter((i) => isActiveInMonth(i.startMonth, i.endMonth, selectedMonth))
      .reduce((s, i) => s + i.amountPerMonth, 0)
      
    const purchasesSum = cards.reduce((cSum, card) => {
      return cSum + card.purchases
        .filter((p) => (p.paidBy === person.id || p.paidBy === person.name) && isActiveInMonth(p.startMonth, p.endMonth, selectedMonth))
        .reduce((pSum, p) => pSum + p.amountPerMonth, 0)
    }, 0)

    return sum + itemsSum + purchasesSum
  }, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">PIX a Receber</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total este mês: <MoneyValue value={totalReceivable} colored />
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddPerson(true)}>
          <Plus size={15} /> Nova pessoa
        </button>
      </div>

      {showAddPerson && (
        <div className="card p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="label">Nome</label>
            <input
              className="input"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Nome da pessoa"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPersonName.trim()) {
                  addPixPerson(newPersonName.trim())
                  setNewPersonName('')
                  setShowAddPerson(false)
                }
              }}
              autoFocus
            />
          </div>
          <button className="btn-primary" onClick={() => {
              if (newPersonName.trim()) {
                addPixPerson(newPersonName.trim())
                setNewPersonName('')
                setShowAddPerson(false)
              }
            }}>
            Adicionar
          </button>
          <button className="btn-ghost" onClick={() => setShowAddPerson(false)}>Cancelar</button>
        </div>
      )}

      {pixPeople.map((person) => {
        // Encontrar os itens ativos desta pessoa
        const activeItems = person.items.filter((i) => isActiveInMonth(i.startMonth, i.endMonth, selectedMonth))
        
        // Encontrar as compras ativas de cartões que foram linkadas para esta pessoa
        const linkedPurchases: (Purchase & { cardName: string })[] =[]
        cards.forEach(card => {
          card.purchases.forEach(p => {
            if (p.paidBy === person.id || p.paidBy === person.name) {
              linkedPurchases.push({ ...p, cardName: card.name })
            }
          })
        })
        const activeLinkedPurchases = linkedPurchases.filter(p => isActiveInMonth(p.startMonth, p.endMonth, selectedMonth))

        const monthTotal = activeItems.reduce((s, i) => s + i.amountPerMonth, 0) + 
                           activeLinkedPurchases.reduce((s, p) => s + p.amountPerMonth, 0)

        const isExpanded = expanded === person.id
        const colorClass = PERSON_COLORS[person.id] ?? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'

        return (
          <div key={person.id} className="card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={() => toggle(person.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}>
                  {person.name[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{person.name}</p>
                  <p className="text-xs text-slate-500">
                    {activeItems.length + activeLinkedPurchases.length} iten(s) ativos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MoneyValue value={monthTotal} colored size="md" />
                {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-surface-600">
                <div className="p-3 flex justify-between items-center bg-black/5 dark:bg-black/20">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {person.items.length} Avulso(s) | {linkedPurchases.length} no Cartão
                  </span>
                  <div className="flex gap-2">
                    <button className="btn-ghost text-xs py-1" onClick={() => {
                        const name = prompt('Novo nome:', person.name)
                        if (name?.trim()) updatePixPerson(person.id, name.trim())
                      }}>
                      <Pencil size={13} /> Renomear
                    </button>
                    <button className="btn-danger text-xs py-1" onClick={() => {
                        if (confirm(`Excluir ${person.name} e todos os itens avulsos? (As compras do cartão não serão apagadas, apenas desvinculadas)`))
                          deletePixPerson(person.id)
                      }}>
                      <Trash2 size={13} /> Excluir
                    </button>
                    <button className="btn-primary text-xs py-1" onClick={() => setItemModal({ personId: person.id, personName: person.name })}>
                      <Plus size={13} /> Item Avulso
                    </button>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <tbody>
                    {/* Renderiza primeiro as compras de Cartão */}
                    {linkedPurchases.map((p) => {
                      const active = isActiveInMonth(p.startMonth, p.endMonth, selectedMonth)
                      return (
                        <tr key={`card-${p.id}`} className={`border-b border-surface-600 hover:bg-black/5 dark:hover:bg-white/5 ${!active ? 'opacity-40' : ''}`}>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-sm">{p.name}</p>
                            <p className="text-[10px] uppercase font-bold mt-0.5 flex items-center gap-1 opacity-70" style={{ color: 'var(--accent)' }}>
                              <CreditCard size={10} /> {p.cardName}
                            </p>
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell text-xs text-slate-500">
                            {p.startMonth} → {p.endMonth ?? '∞'}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <MoneyValue value={p.amountPerMonth} colored />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Vem do Cartão</span>
                          </td>
                        </tr>
                      )
                    })}

                    {/* Renderiza depois os itens de PIX manual */}
                    {person.items.map((item) => {
                      const active = isActiveInMonth(item.startMonth, item.endMonth, selectedMonth)
                      return (
                        <tr key={`item-${item.id}`} className={`border-b border-surface-600 hover:bg-black/5 dark:hover:bg-white/5 ${!active ? 'opacity-40' : ''}`}>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-sm">{item.description}</p>
                            {!item.endMonth ? <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">Recorrente</p> : null}
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell text-xs text-slate-500">
                            {item.startMonth} → {item.endMonth ?? '∞'}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <MoneyValue value={item.amountPerMonth} colored />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1 justify-end">
                              <button className="btn-ghost p-1" onClick={() => setItemModal({ personId: person.id, personName: person.name, item })}>
                                <Pencil size={13} />
                              </button>
                              <button className="btn-danger p-1" onClick={() => {
                                  if (confirm('Excluir este item?')) deletePixItem(person.id, item.id)
                                }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {(person.items.length === 0 && linkedPurchases.length === 0) && (
                  <p className="text-center text-slate-500 text-sm py-6">Nenhum item ou compra cadastrada.</p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {itemModal && (
        <PixItemModal personName={itemModal.personName} initial={itemModal.item} onSave={(data) => {
            if (itemModal.item) updatePixItem(itemModal.personId, itemModal.item.id, data)
            else addPixItem(itemModal.personId, data)
            setItemModal(null)
          }} onClose={() => setItemModal(null)} />
      )}
    </div>
  )
}