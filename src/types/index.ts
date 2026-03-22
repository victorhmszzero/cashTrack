// src/types/index.ts

export interface Parcela {
  id: string;
  descricao: string;
  valor: number;
  parcelaAtual: number;
  totalParcelas: number;
  vencimento: string;
  responsavel: string; // 'Eu', 'Cris', 'Isaura', etc.
}

export interface Cartao {
  id: string;
  nome: string;
  cor: string;
  diaVencimento: number;
  transacoes: Parcela[];
}

export interface BancoDivida {
  nome: string;
  valorNegativo: number;
  prioridade: number;
}