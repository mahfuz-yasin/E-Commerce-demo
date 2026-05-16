import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    auth: null
}

export const authReducer = createSlice({
    name: 'authStore',
    initialState,
    reducers: {
        login: (state, action) => {
            if (state && action.payload) {
                state.auth = action.payload
            } else if (state) {
                state.auth = null
            }
        },
        logout: (state) => {
            if (state) {
                state.auth = null
            }
        },
    }
})

export const { login, logout } = authReducer.actions
export default authReducer.reducer
