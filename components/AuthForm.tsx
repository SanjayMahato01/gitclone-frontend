'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import GitHubMark from './GitHubMark'
import { useLoginMutation, useSignupMutation } from '@/lib/features/api/authApi'


interface ApiError {
    status?: number | string
    data?: { message?: string } | string
}

function getErrorMessage(err: unknown, mode: 'login' | 'signup'): string {
    const fallback =
        mode === 'login'
            ? 'Could not sign you in. Please try again.'
            : 'Could not create your account. Please try again.'

    if (!err || typeof err !== 'object') return fallback

    const { data, status } = err as ApiError

    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object' && typeof data.message === 'string' && data.message.trim()) {
        return data.message
    }

    if (status === 'FETCH_ERROR') return 'Network error. Check your connection and try again.'
    if (status === 'TIMEOUT_ERROR') return 'The request timed out. Please try again.'

    if (status === 401) return 'Incorrect email or password.'
    if (status === 409) return 'That email or username is already taken.'
    if (status === 400) return 'Please check the details you entered.'
    if (typeof status === 'number' && status >= 500) return 'Something went wrong on our end. Try again shortly.'

    return fallback
}

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [login, { isLoading: isLoggingIn }] = useLoginMutation()
    const [signup, { isLoading: isSigningUp }] = useSignupMutation()

    const isLoading = isLoggingIn || isSigningUp

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const email = form.get('email') as string
        const password = form.get('password') as string

        try {
            if (mode === 'login') {
                await login({ email, password }).unwrap()
                toast.success('Welcome back!')
            } else {
                const username = form.get('username') as string
                await signup({ username, email, password }).unwrap()
                toast.success('Account created!')
            }
            router.push('/dashboard')
        } catch (err) {
            toast.error(getErrorMessage(err, mode))
        }
    }

    return (
        <main className="auth-page">
            <div className="ambient ambient-one" />
            <div className="ambient ambient-two" />
            <section className="auth-shell" aria-labelledby="auth-title">
                <div className="brand-lockup">
                    <div className="brand-icon"><GitHubMark /></div>
                    <span>github clone</span>
                </div>
                <div className="auth-card">
                    <div className="auth-header">
                        <p className="eyebrow">Developer workspace</p>
                        <h1 id="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
                        <p className="auth-subtitle">
                            {mode === 'login' ? 'Sign in to search, save, and explore repositories.' : 'Join a simpler way to explore the open-source world.'}
                        </p>
                    </div>

                    <div className="mode-switch">
                        <button type="button" className={mode === 'login' ? 'mode-active' : ''} onClick={() => router.push('/login')}>Sign in</button>
                        <button type="button" className={mode === 'signup' ? 'mode-active' : ''} onClick={() => router.push('/signup')}>Sign up</button>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {mode === 'signup' && (
                            <label><span>Username</span><input name="username" placeholder="octocat" required /></label>
                        )}
                        <label><span>Email address</span><input name="email" type="email" placeholder="you@example.com" required /></label>
                        <label>
                            <span className="label-row">
                                <span>Password</span>
                                {mode === 'login' && <a href="#forgot">Forgot password?</a>}
                            </span>
                            <span className="password-wrap">
                                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" minLength={8} required />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </span>
                        </label>
                        {mode === 'signup' && <p className="password-hint">Use at least 8 characters.</p>}
                        <button className="submit-button" type="submit" disabled={isLoading}>
                            {isLoading
                                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                                : <>{mode === 'login' ? 'Sign in' : 'Create account'} <span aria-hidden="true">→</span></>}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    )
}