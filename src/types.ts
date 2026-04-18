// src\types.ts

export interface Purchase {
	id: string;
	name: string;
	amountPerMonth: number;
	startMonth: string;
	endMonth: string | null;
	paidBy?: string;
	notes?: string;
	purchaseDate?: string;
	categoryId?: string;
	overrides?: Record<string, number>;
}

export interface CreditCard {
	id: string;
	name: string;
	dueDay: number;
	purchases: Purchase[];
}

export interface FixedBill {
	id: string;
	name: string;
	amount: number;
	active: boolean;
	overrides?: Record<string, number>;
	categoryId?: string;
}

export interface PixPerson {
	id: string;
	name: string;
	items: PixItem[];
}

export interface PixItem {
	id: string;
	description: string;
	amountPerMonth: number;
	startMonth: string;
	endMonth: string | null;
}

export interface Category {
	id: string;
	name: string;
	color: string;
	emoji: string;
}

export interface AppSettings {
	salary: number;
	investPercent: number;
	reservePercent: number;
	theme: "light" | "dark";
	accentColor: string;
	startTrackingMonth: string;
}

export interface AppState {
	settings: AppSettings;
	cards: CreditCard[];
	fixedBills: FixedBill[];
	pixPeople: PixPerson[];
	categories: Category[];
}

// ─── Tipos calculados ─────────────────────────────────────────────────────────

export interface MonthlyCardTotal {
	cardId: string;
	cardName: string;
	total: number;
}

export interface CategoryTotal {
	categoryId: string;
	categoryName: string;
	color: string;
	emoji: string;
	total: number;
}

export interface MonthSummary {
	yearMonth: string;
	label: string;
	cardTotals: MonthlyCardTotal[];
	fixedTotal: number;
	totalToPay: number;
	pixReceivable: number;
	pixBreakdown: { personId: string; personName: string; total: number }[];
	categoryBreakdown: CategoryTotal[];
	netToPay: number;
	balance: number;
	toInvest: number;
	toLazer: number;
}
