'use client'

import { combineReducers, configureStore } from "@reduxjs/toolkit"
import authReducer from "./reducer/authReducer"
import cartReducer  from "./reducer/cartReducer"

const rootReducer = combineReducers({
    authStore: authReducer,
    cartStore: cartReducer
})

// Create store without persistence for SSR safety
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
})

// Dummy persistor for compatibility
export const persistor = {
    persist: () => {},
    purge: () => Promise.resolve(),
    flush: () => Promise.resolve(),
    pause: () => {},
    resume: () => {},
}

// Add error boundary for store access
if (typeof window !== 'undefined') {
    window.store = store
    
    // Add error handling for store access
    const originalGetState = store.getState
    store.getState = function() {
        try {
            return originalGetState.apply(this, arguments)
        } catch (error) {
            console.error('Error getting store state:', error)
            return {
                authStore: { auth: null },
                cartStore: { products: [], count: 0 }
            }
        }
    }
}
