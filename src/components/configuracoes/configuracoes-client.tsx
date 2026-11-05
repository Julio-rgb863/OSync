'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { User, Bell, Palette, Shield, Building2, ChevronRight } from 'lucide-react'

type Tab = 'perfil' | 'empresa' | 'aparencia' | 'seguranca'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'aparencia', label: 'Aparência', icon: Palette },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
]

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      />
    </div>
  )
}

export function ConfiguracoesClient() {
  const { data: session, update } = useSession()
  const [tab, setTab] = useState<Tab>('perfil')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  // Perfil
  const [nome, setNome] = useState(session?.user?.name ?? '')
  const [email] = useState(session?.user?.email ?? '')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [senhaNova, setSenhaNova] = useState('')
  const [senhaConfirmar, setSenhaConfirmar] = useState('')

  // Empresa (armazenado no localStorage — sem tabela no DB ainda)
  const [empresa, setEmpresa] = useState(() => {
    if (typeof window === 'undefined') return { nome: '', telefone: '', email: '', endereco: '', cnpj: '' }
    try { return JSON.parse(localStorage.getItem('osync_empresa') ?? '{}') } catch { return {} }
  })

  function showMsg(text: string, type: 'success' | 'error' = 'success') {
    setMsg(text)
    setMsgType(type)
    setTimeout(() => setMsg(''), 4000)
  }

  async function salvarPerfil() {
    if (!nome.trim()) return showMsg('Nome obrigatório', 'error')
    setLoading(true)
    const res = await fetch(`/api/usuarios/${session?.user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nome, email, role: (session?.user as any)?.role }),
    })
    setLoading(false)
    if (res.ok) {
      await update({ name: nome })
      showMsg('Perfil atualizado com sucesso!')
    } else showMsg('Erro ao atualizar perfil', 'error')
  }

  async function alterarSenha() {
    if (!senhaAtual || !senhaNova) return showMsg('Preencha todos os campos', 'error')
    if (senhaNova !== senhaConfirmar) return showMsg('As senhas não coincidem', 'error')
    if (senhaNova.length < 6) return showMsg('Senha mínima: 6 caracteres', 'error')
    setLoading(true)
    const res = await fetch(`/api/usuarios/${session?.user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: session?.user?.name, email, role: (session?.user as any)?.role, password: senhaNova }),
    })
    setLoading(false)
    if (res.ok) {
      setSenhaAtual(''); setSenhaNova(''); setSenhaConfirmar('')
      showMsg('Senha alterada com sucesso!')
    } else showMsg('Erro ao alterar senha', 'error')
  }

  function salvarEmpresa() {
    localStorage.setItem('osync_empresa', JSON.stringify(empresa))
    showMsg('Dados da empresa salvos!')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie suas preferências e dados da conta</p>
      </div>

      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded-xl text-sm ${
            msgType === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {msgType === 'success' ? '✓ ' : '✗ '}{msg}
        </motion.div>
      )}

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="w-48 flex-shrink-0 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {tab === id && <ChevronRight className="w-3 h-3" />}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 p-6 rounded-xl border border-border bg-card space-y-6">
          {/* Perfil */}
          {tab === 'perfil' && (
            <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h2 className="font-semibold">Dados do Perfil</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                  {(session?.user?.name ?? 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{(session?.user as any)?.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField label="Nome completo" value={nome} onChange={setNome} placeholder="Seu nome" />
                </div>
                <div className="col-span-2">
                  <InputField label="E-mail" value={email} disabled />
                </div>
              </div>
              <button
                onClick={salvarPerfil}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </motion.div>
          )}

          {/* Empresa */}
          {tab === 'empresa' && (
            <motion.div key="empresa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h2 className="font-semibold">Dados da Empresa</h2>
              <p className="text-xs text-muted-foreground">
                Estas informações aparecem nos PDFs das Ordens de Serviço.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField
                    label="Nome da empresa"
                    value={empresa.nome ?? ''}
                    onChange={(v) => setEmpresa({ ...empresa, nome: v })}
                    placeholder="TechFix Assistência"
                  />
                </div>
                <InputField
                  label="CNPJ"
                  value={empresa.cnpj ?? ''}
                  onChange={(v) => setEmpresa({ ...empresa, cnpj: v })}
                  placeholder="00.000.000/0001-00"
                />
                <InputField
                  label="Telefone"
                  value={empresa.telefone ?? ''}
                  onChange={(v) => setEmpresa({ ...empresa, telefone: v })}
                  placeholder="(00) 0000-0000"
                />
                <InputField
                  label="E-mail de contato"
                  value={empresa.email ?? ''}
                  onChange={(v) => setEmpresa({ ...empresa, email: v })}
                  placeholder="contato@empresa.com"
                />
                <div className="col-span-2">
                  <InputField
                    label="Endereço"
                    value={empresa.endereco ?? ''}
                    onChange={(v) => setEmpresa({ ...empresa, endereco: v })}
                    placeholder="Rua, nº, Cidade/UF"
                  />
                </div>
              </div>
              <button
                onClick={salvarEmpresa}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Salvar Dados
              </button>
            </motion.div>
          )}

          {/* Aparência */}
          {tab === 'aparencia' && (
            <motion.div key="aparencia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h2 className="font-semibold">Aparência</h2>
              <p className="text-sm text-muted-foreground">
                Use o botão de tema no topo da página para alternar entre modo claro e escuro. O tema é salvo automaticamente.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {(['light', 'dark'] as const).map((t) => (
                  <div
                    key={t}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      t === 'dark' ? 'border-primary bg-zinc-900 text-white' : 'border-border bg-white text-zinc-900'
                    }`}
                  >
                    <div className="text-sm font-medium mb-2">{t === 'dark' ? '🌙 Escuro' : '☀️ Claro'}</div>
                    <div className={`h-2 rounded-full mb-1 ${t === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
                    <div className={`h-2 rounded-full w-2/3 ${t === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Suporte a temas customizados será adicionado em breve.
              </p>
            </motion.div>
          )}

          {/* Segurança */}
          {tab === 'seguranca' && (
            <motion.div key="seguranca" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h2 className="font-semibold">Alterar Senha</h2>
              <div className="space-y-3">
                <InputField
                  label="Senha atual"
                  type="password"
                  value={senhaAtual}
                  onChange={setSenhaAtual}
                  placeholder="••••••••"
                />
                <InputField
                  label="Nova senha"
                  type="password"
                  value={senhaNova}
                  onChange={setSenhaNova}
                  placeholder="Mínimo 6 caracteres"
                />
                <InputField
                  label="Confirmar nova senha"
                  type="password"
                  value={senhaConfirmar}
                  onChange={setSenhaConfirmar}
                  placeholder="Repita a nova senha"
                />
              </div>
              <button
                onClick={alterarSenha}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                ⚠️ Após alterar a senha, você será redirecionado para fazer login novamente.
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
