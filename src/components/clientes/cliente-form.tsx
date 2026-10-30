'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, User, MapPin } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  cpfCnpj: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props { initialData?: any; clienteId?: string }

export function ClienteForm({ initialData, clienteId }: Props) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true); setMsg('')
    try {
      const res = await fetch(clienteId ? `/api/clientes/${clienteId}` : '/api/clientes', {
        method: clienteId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const c = await res.json()
      router.push(`/clientes/${c.id}`)
      router.refresh()
    } catch {
      setMsg('Erro ao salvar cliente. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-lg border border-border hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{clienteId ? 'Editar Cliente' : 'Novo Cliente'}</h1>
          <p className="text-muted-foreground text-sm">Preencha as informações do cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-primary">
              <User className="w-4 h-4" /> Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block">Nome *</label>
                <input {...register('nome')} className={inp} placeholder="Nome completo ou razão social" />
                {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                <input {...register('email')} type="email" className={inp} placeholder="email@exemplo.com" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Telefone</label>
                <input {...register('telefone')} className={inp} placeholder="(00) 00000-0000" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block">CPF / CNPJ</label>
                <input {...register('cpfCnpj')} className={inp} placeholder="000.000.000-00" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-primary">
              <MapPin className="w-4 h-4" /> Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block">Endereço</label>
                <input {...register('endereco')} className={inp} placeholder="Rua, número, complemento" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Cidade</label>
                <input {...register('cidade')} className={inp} placeholder="São Paulo" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Estado</label>
                <input {...register('estado')} className={inp} placeholder="SP" maxLength={2} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">CEP</label>
                <input {...register('cep')} className={inp} placeholder="00000-000" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Observações</label>
            <textarea {...register('observacoes')} rows={3} className={inp} placeholder="Informações adicionais..." />
          </div>

          {msg && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{msg}</p>}
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {clienteId ? 'Atualizar' : 'Salvar'} Cliente
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
