import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../auth/useAuth'

type Mode = 'signin' | 'signup'

type Message = {
  kind: 'error' | 'success'
  text: string
}

type LoginPageProps = {
  mode: Mode
}

function friendlyError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'That email and password don’t match. Check them and try again.'
      case 'auth/email-already-in-use':
        return 'There’s already an account with this email. Try signing in instead.'
      case 'auth/weak-password':
        return 'Your password needs at least 6 characters.'
      case 'auth/invalid-email':
      case 'auth/missing-email':
        return 'That email address doesn’t look right.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Wait a few minutes and try again.'
      case 'auth/network-request-failed':
        return 'Can’t reach the server. Check your internet connection.'
    }
  }
  return 'Something went wrong. Please try again.'
}

const PERKS = [
  { icon: '🍿', text: 'Save movies, series, anime and animation in one list' },
  { icon: '📝', text: 'Note why you want to watch each one, and who recommended it' },
  { icon: '📺', text: 'See where each title is legally streaming in Nigeria' },
]

function LoginPage({ mode }: LoginPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  if (user) return <Navigate to="/" replace />

  const isSignup = mode === 'signup'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/')
    } catch (err) {
      setMessage({ kind: 'error', text: friendlyError(err) })
    } finally {
      setBusy(false)
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setMessage({
        kind: 'error',
        text: 'Type your email address above first, then tap “Forgot password?” again.',
      })
      return
    }

    setBusy(true)
    setMessage(null)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setMessage({
        kind: 'success',
        text: `If there’s an account for ${email.trim()}, a reset link is on its way. Check your inbox and spam folder.`,
      })
    } catch (err) {
      setMessage({ kind: 'error', text: friendlyError(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <aside className="auth-side">
          <img src="/favicon.svg" alt="" width="56" height="56" />
          <h2>{isSignup ? 'Start your watchlist' : 'Welcome back'}</h2>
          <p>
            {isSignup
              ? 'Free, quick, and no card needed. Just an email and a password.'
              : 'Your list and all your notes are right where you left them.'}
          </p>
          <ul className="auth-perks">
            {PERKS.map((perk) => (
              <li key={perk.text}>
                <span aria-hidden="true">{perk.icon}</span>
                {perk.text}
              </li>
            ))}
          </ul>
        </aside>

        <section className="auth-main">
          <div className="auth-tabs" role="tablist">
            <Link
              to="/login"
              role="tab"
              aria-selected={!isSignup}
              className={!isSignup ? 'auth-tab active' : 'auth-tab'}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              role="tab"
              aria-selected={isSignup}
              className={isSignup ? 'auth-tab active' : 'auth-tab'}
            >
              Create account
            </Link>
          </div>

          <h1>{isSignup ? 'Create your account' : 'Sign in to Popnote'}</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="field">
              <span className="field-label">
                <label htmlFor="auth-password">Password</label>
                {!isSignup && (
                  <button
                    type="button"
                    className="field-link"
                    onClick={handleForgotPassword}
                    disabled={busy}
                  >
                    Forgot password?
                  </button>
                )}
              </span>
              <span className="password-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
              {isSignup && (
                <span className="field-hint">
                  {password.length >= 6
                    ? '✓ Long enough'
                    : `${6 - password.length} more character${6 - password.length === 1 ? '' : 's'} needed`}
                </span>
              )}
            </div>

            {message && (
              <p
                className={message.kind === 'error' ? 'form-alert error' : 'form-alert success'}
                role={message.kind === 'error' ? 'alert' : 'status'}
              >
                {message.text}
              </p>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
              {busy ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : 'New to Popnote?'}{' '}
            <Link to={isSignup ? '/login' : '/signup'} className="text-link">
              {isSignup ? 'Sign in' : 'Create a free account'}
            </Link>
          </p>

          <p className="auth-small">
            Popnote is a bookmarking site. We don’t stream or host films.
          </p>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
