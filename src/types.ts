// src/types.ts

/**
 * Uma compra/cobrança em um cartão.
 * A cobrança aparece em todas as faturas de `startMonth` até `endMonth` (inclusive).
 * Para despesas recorrentes (sem fim previsto), `endMonth` é null.
 */
export interface Purchase {
  id: string
  name: string
  /** Valor da parcela/mensalidade */
  amountPerMonth: number
  /** Mês inicial no formato "YYYY-MM" (ex: "2026-03") */
  startMonth: string
  /** Mês final no formato "YYYY-MM", ou null se for recorrente sem fim */
  endMonth: string | null
  /** Pessoa que usou o cartão e deve reembolso (opcional) */
  paidBy?: string
  notes?: string
}

/** Cartão de crédito */
export interface CreditCard {
  id: string
  /** Nome de exibição (ex: "Atacadão") */
  name: string
  /** Dia de vencimento da fatura */
  dueDay: number
  purchases: Purchase[]
}

/** Conta fixa (Enel, Água, etc.) */
export interface FixedBill {
  id: string
  name: string
  amount: number
  active: boolean
  overrides?: Record<string, number> 
}
/** Pessoa que usa o cartão da mãe e paga via PIX */
export interface PixPerson {
  id: string
  name: string
  /** Itens mensais que esta pessoa deve pagar */
  items: PixItem[]
}

export interface PixItem {
  id: string
  description: string
  amountPerMonth: number
  startMonth: string
  endMonth: string | null
}

// ─── Estado geral da aplicação ────────────────────────────────────────────────

export interface AppSettings {
  salary: number
  investPercent: number   // ex: 10 para 10%
  reservePercent: number  // ex: 0 para 0%
  theme: 'light' | 'dark' 
    accentColor: string // <-- Adicione isso (ex: "#3b82f6" ou "pink")
}

export interface AppState {
  settings: AppSettings
  cards: CreditCard[]
  fixedBills: FixedBill[]
  pixPeople: PixPerson[]
}

// ─── Tipos calculados ─────────────────────────────────────────────────────────

export interface MonthlyCardTotal {
  cardId: string
  cardName: string
  total: number
}

export interface MonthSummary {
  yearMonth: string          // "2026-03"
  label: string              // "Mar/26"
  cardTotals: MonthlyCardTotal[]
  fixedTotal: number
  totalToPay: number
  pixReceivable: number      // quanto vai receber via PIX (valor positivo)
    pixBreakdown: { personId: string; personName: string; total: number }[] // <-- Novo
  netToPay: number           // totalToPay - pixReceivable
  balance: number            // salário - netToPay
  toInvest: number
  toLazer: number
}
