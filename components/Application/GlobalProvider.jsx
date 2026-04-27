'use client'
import React, { Suspense } from 'react'
import { Provider } from 'react-redux'
import Loading from './Loading'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { store, persistor } from '@/store/client-store'

const queryClient = new QueryClient()

const GlobalProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <Suspense fallback={<Loading />}>
                    {children}
                </Suspense>
            </Provider>
            <Suspense fallback={null}>
                <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
        </QueryClientProvider>
    )
}

export default GlobalProvider