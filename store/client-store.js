'use client'

import { combineReducers, configureStore } from "@reduxjs/toolkit"
import authReducer from "./reducer/authReducer"
import cartReducer  from "./reducer/cartReducer"

const rootReducer = combineReducers({
    authStore: authReducer,
    cartStore: cartReducer
})

// Preloaded state to ensure store is always properly initialized
const preloadedState = {
    authStore: { auth: null },
    cartStore: { products: [], count: 0 }
}

// Create store without persistence for SSR safety
export const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ 
            serializableCheck: false,
            immutableCheck: false,
            thunk: true
        }),
    devTools: process.env.NODE_ENV !== 'production'
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
    
    // Ensure store is ready before accessing
    store.ready = true
    
    // Add error handling for store access
    const originalGetState = store.getState
    store.getState = function() {
        try {
            const state = originalGetState.apply(this, arguments)
            // Ensure authStore and auth are always defined
            if (!state) {
                return preloadedState
            }
            if (!state.authStore) {
                return {
                    ...state,
                    authStore: { auth: null }
                }
            }
            if (state.authStore.auth === undefined) {
                return {
                    ...state,
                    authStore: { ...state.authStore, auth: null }
                }
            }
            return state
        } catch (error) {
            console.error('Error getting store state:', error)
            return preloadedState
        }
    }
    
    // Add error handling for dispatch
    const originalDispatch = store.dispatch
    store.dispatch = function(action) {
        try {
            return originalDispatch.apply(this, arguments)
        } catch (error) {
            console.error('Error dispatching action:', error, action)
            throw error
        }
    }
}
