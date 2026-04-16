import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const res = await api.get('/orders/cart/');
  return res.data;
});
export const addToCart = createAsyncThunk('cart/add', async (data) => {
  const res = await api.post('/orders/cart/', data);
  return res.data;
});
export const updateCartItem = createAsyncThunk('cart/update', async (data) => {
  const res = await api.put('/orders/cart/', data);
  return res.data;
});
export const removeFromCart = createAsyncThunk('cart/remove', async (item_id) => {
  const res = await api.delete(`/orders/cart/?item_id=${item_id}`);
  return res.data;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cart: null, loading: false, isOpen: false },
  reducers: { toggleCart: (state) => { state.isOpen = !state.isOpen; } },
  extraReducers: (b) => {
    [fetchCart, addToCart, updateCartItem, removeFromCart].forEach(action => {
      b.addCase(action.fulfilled, (state, action) => { state.cart = action.payload; state.loading = false; });
      b.addCase(action.pending, (state) => { state.loading = true; });
    });
  },
});
export const { toggleCart } = cartSlice.actions;
export default cartSlice.reducer;
