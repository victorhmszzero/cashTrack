// src/store/useStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import {
  AppState,
  CreditCard,
  Purchase,
  FixedBill,
  PixPerson,
  PixItem,
  AppSettings,
} from '../types'
import { initialData } from '../data/initialData'

interface Store extends AppState {
  // Settings
  updateSettings: (s: Partial<AppSettings>) => void

  // Cards
  addCard: (card: Omit<CreditCard, 'id' | 'purchases'>) => void
  updateCard: (id: string, data: Partial<Omit<CreditCard, 'id' | 'purchases'>>) => void
  deleteCard: (id: string) => void

  // Purchases
  addPurchase: (cardId: string, p: Omit<Purchase, 'id'>) => void
  updatePurchase: (cardId: string, purchaseId: string, data: Partial<Omit<Purchase, 'id'>>) => void
  deletePurchase: (cardId: string, purchaseId: string) => void

  // Fixed bills
  addFixedBill: (bill: Omit<FixedBill, 'id'>) => void
  updateFixedBill: (id: string, data: Partial<Omit<FixedBill, 'id'>>) => void
  deleteFixedBill: (id: string) => void
  setFixedBillOverride: (id: string, month: string, amount: number | null) => void // <-- Novo

  // Pix people
  addPixPerson: (name: string) => void
  updatePixPerson: (id: string, name: string) => void
  deletePixPerson: (id: string) => void

  // Pix items
  addPixItem: (personId: string, item: Omit<PixItem, 'id'>) => void
  updatePixItem: (personId: string, itemId: string, data: Partial<Omit<PixItem, 'id'>>) => void
  deletePixItem: (personId: string, itemId: string) => void

  // Reset
  resetToInitial: () => void
  importData: (json: string) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...initialData,

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      addCard: (card) =>
        set((state) => ({
          cards: [...state.cards, { ...card, id: uuid(), purchases: [] }],
        })),

      updateCard: (id, data) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteCard: (id) =>
        set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),

      addPurchase: (cardId, p) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId
              ? { ...c, purchases: [...c.purchases, { ...p, id: uuid() }] }
              : c
          ),
        })),

      updatePurchase: (cardId, purchaseId, data) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  purchases: c.purchases.map((p) =>
                    p.id === purchaseId ? { ...p, ...data } : p
                  ),
                }
              : c
          ),
        })),

      deletePurchase: (cardId, purchaseId) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId
              ? { ...c, purchases: c.purchases.filter((p) => p.id !== purchaseId) }
              : c
          ),
        })),

      addFixedBill: (bill) =>
        set((state) => ({
          fixedBills: [...state.fixedBills, { ...bill, id: uuid() }],
        })),

      updateFixedBill: (id, data) =>
        set((state) => ({
          fixedBills: state.fixedBills.map((b) => (b.id === id ? { ...b, ...data } : b)),
        })),

      deleteFixedBill: (id) =>
        set((state) => ({ fixedBills: state.fixedBills.filter((b) => b.id !== id) })),
      
      setFixedBillOverride: (id, month, amount) =>
        set((state) => ({
          fixedBills: state.fixedBills.map((b) => {
            if (b.id !== id) return b
            const overrides = { ...b.overrides }
            if (amount === null) delete overrides[month]
            else overrides[month] = amount
            return { ...b, overrides }
          }),
        })),

      addPixPerson: (name) =>
        set((state) => ({
          pixPeople: [...state.pixPeople, { id: uuid(), name, items: [] }],
        })),

      updatePixPerson: (id, name) =>
        set((state) => ({
          pixPeople: state.pixPeople.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      deletePixPerson: (id) =>
        set((state) => ({ pixPeople: state.pixPeople.filter((p) => p.id !== id) })),

      addPixItem: (personId, item) =>
        set((state) => ({
          pixPeople: state.pixPeople.map((p) =>
            p.id === personId
              ? { ...p, items: [...p.items, { ...item, id: uuid() }] }
              : p
          ),
        })),

      updatePixItem: (personId, itemId, data) =>
        set((state) => ({
          pixPeople: state.pixPeople.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  items: p.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)),
                }
              : p
          ),
        })),

      deletePixItem: (personId, itemId) =>
        set((state) => ({
          pixPeople: state.pixPeople.map((p) =>
            p.id === personId
              ? { ...p, items: p.items.filter((i) => i.id !== itemId) }
              : p
          ),
        })),

      resetToInitial: () => set(initialData),

      importData: (json: string) => {
        try {
          const parsed = JSON.parse(json) as AppState
          if (!parsed.cards || !parsed.settings || !parsed.pixPeople || !parsed.fixedBills) {
            throw new Error('Formato inválido')
          }
          set(parsed)
        } catch {
          throw new Error('JSON inválido ou com formato incorreto')
        }
      },
    }),
    {
      name: 'mae-contas-v1',
    }
  )
)
