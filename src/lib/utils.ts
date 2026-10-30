import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const STATUS_OS = {
  ABERTA: {
    label: 'Aberta',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  EM_ANDAMENTO: {
    label: 'Em Andamento',
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  },
  AGUARDANDO_PECA: {
    label: 'Aguardando Peça',
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  CONCLUIDA: {
    label: 'Concluída',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  ENTREGUE: {
    label: 'Entregue',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  CANCELADA: {
    label: 'Cancelada',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
}

export const PRIORIDADE_OS = {
  BAIXA: { label: 'Baixa', bg: 'bg-slate-500/20', text: 'text-slate-400' },
  MEDIA: { label: 'Média', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  ALTA: { label: 'Alta', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  URGENTE: { label: 'Urgente', bg: 'bg-red-500/20', text: 'text-red-400' },
}

export const TIPO_EQUIPAMENTO = {
  COMPUTADOR: { label: 'Computador', icon: '🖥️' },
  NOTEBOOK: { label: 'Notebook', icon: '💻' },
  IMPRESSORA: { label: 'Impressora', icon: '🖨️' },
  CELULAR: { label: 'Celular', icon: '📱' },
  TABLET: { label: 'Tablet', icon: '📱' },
  MAQUINA: { label: 'Máquina', icon: '⚙️' },
  OUTRO: { label: 'Outro', icon: '🔧' },
}

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  TECNICO: 'Técnico',
  ATENDENTE: 'Atendente',
}
