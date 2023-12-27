import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

// initial state
const initialState = {
    totalItem: localStorage.getItem("totalItems") ? JSON.parse(localStorage.getItem("totalItems")) : 0,
};

// create slice
const cartSlice = createSlice({
    name: "cart",
    initialState: initialState,
    reducers: {
        setTotalItems(state, value) {
            state.totalItem = value.payload;
        }

        // add to cart function

        // remove from cart function

        // reset cart function
    }
});

export const { setTotalItems } = cartSlice.actions;
export default cartSlice.reducer;