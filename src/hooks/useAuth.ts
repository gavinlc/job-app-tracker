import { useState, useEffect, useCallback } from 'react'
import { stackClientApp } from '../stack'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await stackClientApp.getUser({ or: 'return-null' })
      setUser(currentUser)
      setIsLoading(false)
    } catch {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check if user is already signed in on mount
    checkUser()

    // Listen for storage changes (cookies might trigger this)
    const handleStorageChange = () => {
      checkUser()
    }
    
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [checkUser])

  const signOut = async () => {
    await stackClientApp.signOut()
    setUser(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refresh: checkUser,
  }
}

