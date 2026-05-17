import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    count: 0,
    products: []
}

export const cartReducer = createSlice({
    name: 'cartStore',
    initialState,
    reducers: {
        addIntoCart: (state, action) => {
            const payload = action.payload || {}
            if (!payload.productId || !payload.variantId) return
            
            const existingProductIndex = state.products.findIndex(
                (product) => product.productId === payload.productId && 
                           product.variantId === payload.variantId && 
                           product.size === payload.size
            )

            if (existingProductIndex < 0) {
                // Create new cart item with unique ID
                const newItem = {
                    ...payload,
                    cartItemId: Date.now() + Math.random().toString(36).substr(2, 9)
                }
                state.products.push(newItem)
                state.count = state.products.length
            }
        },
        increaseQuantity: (state, action) => {
            const payload = action.payload || {}
            const { productId, variantId, size } = payload
            if (!productId || !variantId) return
            
            const existingProductIndex = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId && product.size === size
            )

            if (existingProductIndex >= 0) {
                state.products[existingProductIndex].qty += 1
            }
        },
        decreaseQuantity: (state, action) => {
            const payload = action.payload || {}
            const { productId, variantId, size } = payload
            if (!productId || !variantId) return
            
            const existingProductIndex = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId && product.size === size
            )

            if (existingProductIndex >= 0) {
                if (state.products[existingProductIndex].qty > 1) {
                    state.products[existingProductIndex].qty -= 1
                }
            }
        },
        removeFromCart: (state, action) => {
            const payload = action.payload || {}
            const { productId, variantId, size } = payload
            if (!productId || !variantId) return

            state.products = state.products.filter(
                (product) => !(product.productId === productId && product.variantId === variantId && product.size === size)
            )
            state.count = state.products.length
        },
        clearCart: (state, action) => {
            state.products = []
            state.count = 0
        }

    }
})

export const {
    addIntoCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart
} = cartReducer.actions
export default cartReducer.reducer
