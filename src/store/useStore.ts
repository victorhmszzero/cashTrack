// src\store\useStore.ts
// src/store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

import type {
	AppState,
	CreditCard,
	Purchase,
	FixedBill,
	PixItem,
	AppSettings,
	Category,
} from "../types";
import { initialData } from "../data/initialData";

interface Store extends AppState {
	updateSettings: (s: Partial<AppSettings>) => void;

	addCard: (card: Omit<CreditCard, "id" | "purchases">) => void;
	updateCard: (
		id: string,
		data: Partial<Omit<CreditCard, "id" | "purchases">>,
	) => void;
	deleteCard: (id: string) => void;

	addPurchase: (cardId: string, p: Omit<Purchase, "id">) => void;
	updatePurchase: (
		cardId: string,
		purchaseId: string,
		data: Partial<Omit<Purchase, "id">>,
	) => void;
	deletePurchase: (cardId: string, purchaseId: string) => void;
	setPurchaseOverride: (
		cardId: string,
		purchaseId: string,
		month: string,
		amount: number | null,
	) => void;

	addFixedBill: (bill: Omit<FixedBill, "id">) => void;
	updateFixedBill: (id: string, data: Partial<Omit<FixedBill, "id">>) => void;
	deleteFixedBill: (id: string) => void;
	setFixedBillOverride: (
		id: string,
		month: string,
		amount: number | null,
	) => void;

	addPixPerson: (name: string) => void;
	updatePixPerson: (id: string, name: string) => void;
	deletePixPerson: (id: string) => void;
	addPixItem: (personId: string, item: Omit<PixItem, "id">) => void;
	updatePixItem: (
		personId: string,
		itemId: string,
		data: Partial<Omit<PixItem, "id">>,
	) => void;
	deletePixItem: (personId: string, itemId: string) => void;

	addCategory: (cat: Omit<Category, "id">) => void;
	updateCategory: (id: string, data: Partial<Omit<Category, "id">>) => void;
	deleteCategory: (id: string) => void;

	resetToInitial: () => void;
	importData: (json: string) => void;
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
							: c,
					),
				})),
			updatePurchase: (cardId, purchaseId, data) =>
				set((state) => ({
					cards: state.cards.map((c) =>
						c.id === cardId
							? {
									...c,
									purchases: c.purchases.map((p) =>
										p.id === purchaseId ? { ...p, ...data } : p,
									),
								}
							: c,
					),
				})),
			deletePurchase: (cardId, purchaseId) =>
				set((state) => ({
					cards: state.cards.map((c) =>
						c.id === cardId
							? {
									...c,
									purchases: c.purchases.filter((p) => p.id !== purchaseId),
								}
							: c,
					),
				})),
			setPurchaseOverride: (cardId, purchaseId, month, amount) =>
				set((state) => ({
					cards: state.cards.map((c) =>
						c.id === cardId
							? {
									...c,
									purchases: c.purchases.map((p) => {
										if (p.id !== purchaseId) return p;
										const overrides = { ...(p.overrides ?? {}) };
										if (amount === null) delete overrides[month];
										else overrides[month] = amount;
										return { ...p, overrides };
									}),
								}
							: c,
					),
				})),

			addFixedBill: (bill) =>
				set((state) => ({
					fixedBills: [...state.fixedBills, { ...bill, id: uuid() }],
				})),
			updateFixedBill: (id, data) =>
				set((state) => ({
					fixedBills: state.fixedBills.map((b) =>
						b.id === id ? { ...b, ...data } : b,
					),
				})),
			deleteFixedBill: (id) =>
				set((state) => ({
					fixedBills: state.fixedBills.filter((b) => b.id !== id),
				})),
			setFixedBillOverride: (id, month, amount) =>
				set((state) => ({
					fixedBills: state.fixedBills.map((b) => {
						if (b.id !== id) return b;
						const overrides = { ...(b.overrides ?? {}) };
						if (amount === null) delete overrides[month];
						else overrides[month] = amount;
						return { ...b, overrides };
					}),
				})),

			addPixPerson: (name) =>
				set((state) => ({
					pixPeople: [...state.pixPeople, { id: uuid(), name, items: [] }],
				})),
			updatePixPerson: (id, name) =>
				set((state) => ({
					pixPeople: state.pixPeople.map((p) =>
						p.id === id ? { ...p, name } : p,
					),
				})),
			deletePixPerson: (id) =>
				set((state) => ({
					pixPeople: state.pixPeople.filter((p) => p.id !== id),
				})),
			addPixItem: (personId, item) =>
				set((state) => ({
					pixPeople: state.pixPeople.map((p) =>
						p.id === personId
							? { ...p, items: [...p.items, { ...item, id: uuid() }] }
							: p,
					),
				})),
			updatePixItem: (personId, itemId, data) =>
				set((state) => ({
					pixPeople: state.pixPeople.map((p) =>
						p.id === personId
							? {
									...p,
									items: p.items.map((i) =>
										i.id === itemId ? { ...i, ...data } : i,
									),
								}
							: p,
					),
				})),
			deletePixItem: (personId, itemId) =>
				set((state) => ({
					pixPeople: state.pixPeople.map((p) =>
						p.id === personId
							? { ...p, items: p.items.filter((i) => i.id !== itemId) }
							: p,
					),
				})),

			addCategory: (cat) =>
				set((state) => ({
					categories: [...(state.categories ?? []), { ...cat, id: uuid() }],
				})),
			updateCategory: (id, data) =>
				set((state) => ({
					categories: (state.categories ?? []).map((c) =>
						c.id === id ? { ...c, ...data } : c,
					),
				})),
			deleteCategory: (id) =>
				set((state) => ({
					categories: (state.categories ?? []).filter((c) => c.id !== id),
				})),

			resetToInitial: () => set(initialData),
			importData: (json: string) => {
				try {
					const parsed = JSON.parse(json) as AppState;
					if (
						!parsed.cards ||
						!parsed.settings ||
						!parsed.pixPeople ||
						!parsed.fixedBills
					)
						throw new Error("Formato inválido");
					// garante categories mesmo em backups antigos
					if (!parsed.categories) parsed.categories = initialData.categories;
					set(parsed);
				} catch {
					throw new Error("JSON inválido ou com formato incorreto");
				}
			},
		}),
		{
			name: "mae-contas-v2",
			// merge garante que novos campos (categories) apareçam mesmo em stores antigos
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			merge: (persisted: any, current) => ({
				...current,
				...persisted,
				categories: persisted.categories ?? current.categories,
			}),
		},
	),
);
