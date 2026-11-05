'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Logo } from '@/components/shared/logo'

const loginSchema = z.object({
  email: z.string().email('E-mail corporativo inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})
type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError('')
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Logo size={36} showWordmark={true} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            Plataforma Corporativa de Gestão Integrada
          </p>
        </div>

        {/* Enterprise Login Card */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-modal">
          <div className="mb-5">
            <h1 className="text-base font-semibold text-foreground tracking-tight">
              Acessar sua conta
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Informe suas credenciais corporativas
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                E-mail corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="nome@empresa.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-foreground">
                  Senha
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-9 py-2 rounded-md bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-2.5 rounded-md text-xs text-destructive bg-destructive/10 border border-destructive/20 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-subtle mt-1"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Entrar no sistema
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Tray */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Credenciais de Demonstração
            </p>
            <div className="space-y-1 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/60">
              <div className="flex justify-between">
                <span>Administrador:</span>
                <span className="font-mono text-foreground">admin@osync.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span>Técnico:</span>
                <span className="font-mono text-foreground">tecnico@osync.com / tecnico123</span>
              </div>
              <div className="flex justify-between">
                <span>Atendente:</span>
                <span className="font-mono text-foreground">atendente@osync.com / atendente123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Meta */}
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          OSync Enterprise v1.0.0 · Ambiente Seguro & Criptografado
        </p>
      </div>
    </div>
  )
}
