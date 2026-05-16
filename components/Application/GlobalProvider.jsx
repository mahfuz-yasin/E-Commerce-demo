'use client'
import React, { Suspense, useEffect, useState } from 'react'
import Loading from './Loading'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'react-redux'
import { store } from '@/store/client-store'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const ReduxProviderWrapper = ({ children }) => {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        // Ensure store is fully initialized before rendering
        if (store && store.getState) {
            try {
                // Test if store is ready
                store.getState()
                setIsReady(true)
            } catch (error) {
                console.error('Store not ready:', error)
                // Retry after a short delay
                const timer = setTimeout(() => {
                    setIsReady(true)
                }, 100)
                return () => clearTimeout(timer)
            }
        } else {
            setIsReady(true)
        }
    }, [])

    if (!isReady) {
        return <Loading />
    }

    return <Provider store={store}>{children}</Provider>
}

const GlobalProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ReduxProviderWrapper>
                <Suspense fallback={<Loading />}>
                    {children}
                    <ToastContainer />
                </Suspense>
            </ReduxProviderWrapper>
            <Suspense fallback={null}>
                <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
        </QueryClientProvider>
    )
}

export default GlobalProvider