'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Wrench, ArrowRight, Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})
type LoginFormData = z.infer<typeof loginSchema>

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

function Particles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const list: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: ((i * 37) % 95) + 2,
      y: ((i * 53) % 95) + 2,
      size: (i % 3) + 2,
      duration: 10 + (i % 10),
      delay: (i % 5),
    }))
    setParticles(list)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-500/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

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
      if (result?.error) setError('Email ou senha inválidos')
      else { router.push('/dashboard'); router.refresh() }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      <Particles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.3)', '0 0 60px rgba(99,102,241,0.6)', '0 0 20px rgba(99,102,241,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center mb-4"
          >
            <Wrench className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">OSync</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sistema de Ordem de Serviço</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="glass rounded-2xl p-8"
        >
          <h2 className="text-xl font-semibold mb-6">Entrar na plataforma</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Entrar <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">✨ Credenciais de demonstração:</p>
            <p className="text-xs text-muted-foreground">Email: <span className="text-foreground font-mono">admin@osync.com</span></p>
            <p className="text-xs text-muted-foreground">Senha: <span className="text-foreground font-mono">admin123</span></p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
