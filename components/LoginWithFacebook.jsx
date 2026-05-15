'use client'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Facebook } from 'lucide-react'
import { useState } from 'react'

export default function LoginWithFacebook({ callbackUrl, className = '' }) {
  const [loading, setLoading] = useState(false)

  const handleFacebookLogin = async () => {
    try {
      setLoading(true)
      await signIn('facebook', { 
        callbackUrl: callbackUrl || '/dashboard' 
      })
    } catch (error) {
      console.error('Facebook login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 ${className}`}
      onClick={handleFacebookLogin}
      disabled={loading}
    >
      <Facebook className="h-4 w-4 mr-2" />
      {loading ? 'Signing in...' : 'Continue with Facebook'}
    </Button>
  )
}
