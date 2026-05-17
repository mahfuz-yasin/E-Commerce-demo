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
        getDefaultMiddleware({ 
            serializableCheck: false,
            immutableCheck: false
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
