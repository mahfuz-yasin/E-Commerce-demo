import React, { Suspense } from 'react'
import LoginContent from './LoginContent'

const LoginPage = () => {
    return (
        <Suspense fallback={<div className='flex justify-center items-center min-h-screen'>Loading...</div>}>
            <LoginContent />
        </Suspense>
    )
}

export default LoginPage