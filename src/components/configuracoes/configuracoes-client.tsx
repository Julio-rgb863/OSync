'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { User, Palette, Shield, Building2, ChevronRight, Workflow, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

type Tab = 'perfil' | 'empresa' | 'integracoes' | 'aparencia' | 'seguranca'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'integracoes', label: 'Integrações', icon: Workflow },
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

  // Empresa
  const [empresa, setEmpresa] = useState(() => {
    if (typeof window === 'undefined') return { nome: '', telefone: '', email: '', endereco: '', cnpj: '' }
    try { return JSON.parse(localStorage.getItem('osync_empresa') ?? '{}') } catch { return {} }
  })

  // Integração monday.com
  const [mondayToken, setMondayToken] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('osync_monday_token') || 'ory_ac_hUCKe-WJQiD1IJTqMvcgm-uJcTPDpuS3kOGPlnhrGRQ.4yN0dZ_3cuQjgKN2tARPKg0RIBNp5pHg1wWKGr6lrEQ'
  })
  const [mondayTesting, setMondayTesting] = useState(false)
  const [mondayStatus, setMondayStatus] = useState<{
    ok?: boolean
    user?: { id: string; name: string; email: string }
    boards?: Array<{ id: string; name: string; state: string }>
    error?: string
  } | null>(null)

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

  async function testarMonday() {
    if (!mondayToken.trim()) return showMsg('Informe o token do monday.com', 'error')
    setMondayTesting(true)
    setMondayStatus(null)

    try {
      const res = await fetch('/api/integrations/monday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mondayToken.trim() }),
      })
      const data = await res.json()

      if (data.ok) {
        setMondayStatus({ ok: true, user: data.user, boards: data.boards })
        localStorage.setItem('osync_monday_token', mondayToken.trim())
        showMsg('Conexão com monday.com bem sucedida!')
      } else {
        setMondayStatus({ ok: false, error: data.error })
        showMsg(data.error || 'Falha ao autenticar com monday.com', 'error')
      }
    } catch {
      setMondayStatus({ ok: false, error: 'Erro de rede ao conectar com monday.com' })
      showMsg('Erro de rede ao conectar com monday.com', 'error')
    } finally {
      setMondayTesting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground text-xs">Gerencie suas preferências corporativas, integrações e segurança</p>
      </div>

      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-3 py-2 rounded-md text-xs font-medium ${
            msgType === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}
        >
          {msgType === 'success' ? '✓ ' : '✗ '}{msg}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <nav className="w-full md:w-52 flex-shrink-0 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-xs transition-colors ${
                tab === id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {tab === id && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 p-5 rounded-lg border border-border bg-card shadow-subtle space-y-5">
          {/* Perfil */}
          {tab === 'perfil' && (
            <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-sm font-semibold">Dados do Perfil</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-lg font-bold text-foreground border border-border">
                  {(session?.user?.name ?? 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{session?.user?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(session?.user as any)?.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-subtle"
              >
                {loading ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </motion.div>
          )}

          {/* Empresa */}
          {tab === 'empresa' && (
            <motion.div key="empresa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-sm font-semibold">Dados da Empresa</h2>
              <p className="text-xs text-muted-foreground">
                Estas informações aparecem no cabeçalho das ordens de serviço e relatórios fiscais.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <InputField
                    label="Nome da empresa / Razão Social"
                    value={empresa.nome ?? ''}
                    onChange={(v) => setEmpresa({ ...empresa, nome: v })}
                    placeholder="TechFix Operações Ltda"
                  />
                </div>
                <InputField
                  label="CNPJ"
                  value={empresa.cnpj ?? ''}
                  onChange={(v) => setEmpresa({ ...empresa, cnpj: v })}
                  placeholder="00.000.000/0001-00"
                />
                <InputField
                  label="Telefone Corporativo"
                  value={empresa.telefone ?? ''}
                  onChange={(v) => setEmpresa({ ...empresa, telefone: v })}
                  placeholder="(00) 0000-0000"
                />
                <InputField
                  label="E-mail de Contato"
                  value={empresa.email ?? ''}
                  onChange={(v) => setEmpresa({ ...empresa, email: v })}
                  placeholder="operacoes@empresa.com"
                />
                <div className="col-span-2">
                  <InputField
                    label="Endereço / Matriz"
                    value={empresa.endereco ?? ''}
                    onChange={(v) => setEmpresa({ ...empresa, endereco: v })}
                    placeholder="Av. Paulista, 1000 - São Paulo/SP"
                  />
                </div>
              </div>
              <button
                onClick={salvarEmpresa}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-subtle"
              >
                Salvar Dados da Empresa
              </button>
            </motion.div>
          )}

          {/* Integrações (monday.com) */}
          {tab === 'integracoes' && (
            <motion.div key="integracoes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h2 className="text-sm font-semibold">Integrações Corporativas</h2>
                  <p className="text-xs text-muted-foreground">Conecte o OSync a plataformas externas de gestão de trabalho</p>
                </div>
              </div>

              {/* Card monday.com */}
              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#00CA72] text-white flex items-center justify-center font-bold text-base shadow-subtle">
                      m
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">monday.com (Work OS)</h3>
                      <p className="text-[11px] text-muted-foreground">Sincronização bidirecional de Ordens de Serviço, Tarefas e Projetos via API v2</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                    mondayStatus?.ok
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {mondayStatus?.ok ? '● Conectado' : '○ Não Conectado'}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    API Token v2 do monday.com
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={mondayToken}
                      onChange={(e) => setMondayToken(e.target.value)}
                      placeholder="eyJhbGciOi..."
                      className="flex-1 px-3 py-2 rounded-md bg-background border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={testarMonday}
                      disabled={mondayTesting}
                      className="px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 shadow-subtle flex-shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${mondayTesting ? 'animate-spin' : ''}`} />
                      {mondayTesting ? 'Testando...' : 'Testar Conexão'}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Obtenha seu <strong>Personal API Token</strong> permanente no monday.com: <em>Foto de Perfil &gt; Developers &gt; My Access Tokens</em> (começa com <code>eyJ...</code>).
                  </p>
                </div>

                {/* Status da Conexão */}
                {mondayStatus && (
                  <div className={`p-3 rounded-md text-xs border ${
                    mondayStatus.ok
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}>
                    {mondayStatus.ok ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Autenticado com sucesso como {mondayStatus.user?.name} ({mondayStatus.user?.email})
                        </div>
                        {mondayStatus.boards && mondayStatus.boards.length > 0 && (
                          <div className="pt-1 text-[11px] text-muted-foreground">
                            <strong>Quadros disponíveis para sincronizar:</strong>{' '}
                            {mondayStatus.boards.map((b) => b.name).join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        {mondayStatus.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Aparência */}
          {tab === 'aparencia' && (
            <motion.div key="aparencia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-sm font-semibold">Aparência do Sistema</h2>
              <p className="text-xs text-muted-foreground">
                Utilize o alternador no topo do sistema ou selecione abaixo para definir o modo de visualização.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(['dark', 'light'] as const).map((t) => (
                  <div
                    key={t}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition-colors ${
                      t === 'dark' ? 'border-primary bg-zinc-900 text-white' : 'border-border bg-white text-zinc-900'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-2">{t === 'dark' ? '🌙 Modo Escuro (Linear / Vercel)' : '☀️ Modo Claro (Stripe)'}</div>
                    <div className={`h-1.5 rounded-full mb-1 ${t === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
                    <div className={`h-1.5 rounded-full w-2/3 ${t === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Segurança */}
          {tab === 'seguranca' && (
            <motion.div key="seguranca" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-sm font-semibold">Alterar Senha de Acesso</h2>
              <div className="space-y-2.5">
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
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-subtle"
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
