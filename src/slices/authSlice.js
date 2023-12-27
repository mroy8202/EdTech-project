import { createSlice } from "@reduxjs/toolkit";

// initial state
const initialState = {
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
};

// create slice
const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setToken(state, value) {
            state.token = value.payload;
        }
    }
});

export const { setToken } = authSlice.actions;
export default authSlice.reducer;