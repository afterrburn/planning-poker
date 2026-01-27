import { useState, useEffect } from 'react'
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider, ALLOWED_DOMAIN } from '@/lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email || ''
        const domain = email.split('@')[1]

        if (domain !== ALLOWED_DOMAIN) {
          setState({
            user: null,
            loading: false,
            error: `Access denied. Only @${ALLOWED_DOMAIN} accounts allowed.`,
          })
          firebaseSignOut(auth)
          return
        }

        setState({ user, loading: false, error: null })
      } else {
        setState({ user: null, loading: false, error: null })
      }
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      setState((prev) => ({ ...prev, error: null }))
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }))
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }))
    }
  }

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signOut,
  }
}
