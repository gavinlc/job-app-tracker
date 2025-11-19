import { useState, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { stackClientApp } from '../stack'
import { useAuth } from '../hooks/useAuth'

export function ResetPassword() {
  const navigate = useNavigate()
  const { code: codeFromSearch } = useSearch({ from: '/reset-password' })
  const { refresh } = useAuth()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get code from URL query params
  useEffect(() => {
    // Try to get code from TanStack Router search params first, fallback to URL
    const codeParam = codeFromSearch || new URLSearchParams(window.location.search).get('code')
    
    if (codeParam) {
      setCode(codeParam)
      // Verify the code
      stackClientApp.verifyPasswordResetCode(codeParam).then((result) => {
        if (result.status === 'ok') {
          setIsVerifying(false)
        } else {
          setError('Invalid or expired reset code')
          setIsVerifying(false)
        }
      }).catch(() => {
        setError('Failed to verify reset code')
        setIsVerifying(false)
      })
    } else {
      setError('No reset code provided')
      setIsVerifying(false)
    }
  }, [codeFromSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    try {
      const result = await stackClientApp.resetPassword({
        code,
        password,
      })
      
      if (result.status === 'ok') {
        // Refresh auth state and redirect to sign in
        await refresh()
        navigate({ to: '/sign-in', search: { message: 'Password reset successful. Please sign in.' } })
      } else {
        setError(result.error.message || 'Failed to reset password')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Verifying reset code...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !code) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate({ to: '/forgot-password' })}
            >
              Request New Reset Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <a
                href="/sign-in"
                className="text-primary underline-offset-4 hover:underline"
              >
                Back to sign in
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

