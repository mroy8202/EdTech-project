import { createSlice } from "@reduxjs/toolkit";

// initial state
const initialState = {
    user: null,
};

// create slice
const profileSlice = createSlice({
    name: "profile",
    initialState: initialState,
    reducers: {
        setUser(state, value) {
            state.user = value.payload;
        }
    }
});

export const { setUser } = profileSlice.actions;
export default profileSlice.reducer;