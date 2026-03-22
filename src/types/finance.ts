// src/types/finance.ts

export interface Parcela {
  id: string;
  descricao: string;
  valor: number;
  parcelaAtual: number;
  totalParcelas: number;
  vencimento: string; // ISO Date
}

export interface Cartao {
  id: string;
  nome: string;
  diaVencimento: number;
  cor: string; // Ex: '#C00000' para Atacadão
  transacoes: Parcela[];
}