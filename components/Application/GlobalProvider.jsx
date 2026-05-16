'use client'
import React, { Suspense } from 'react'
import Loading from './Loading'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { store } from '@/store/client-store'
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

const GlobalProvider = ({ children }) => {
    // Temporarily disabled Redux store for debugging
    // if (!store) {
    //     console.error('Redux store is undefined')
    //     return <div>Error: Store not initialized</div>
    // }

    return (
        <QueryClientProvider client={queryClient}>
            {/* Temporarily disabled Redux Provider for debugging */}
            {/* <Provider store={store}> */}
                <Suspense fallback={<Loading />}>
                    {children}
                    <ToastContainer />
                </Suspense>
            {/* </Provider> */}
            <Suspense fallback={null}>
                <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
        </QueryClientProvider>
    )
}

export default GlobalProvider