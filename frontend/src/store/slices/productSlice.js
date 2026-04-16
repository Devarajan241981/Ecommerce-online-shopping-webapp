import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetch', async (params = '') => {
  const res = await api.get(`/products/?${params}`);
  return res.data;
});
export const fetchCategories = createAsyncThunk('products/categories', async () => {
  const res = await api.get('/products/categories/');
  return res.data;
});
export const fetchFeatured = createAsyncThunk('products/featured', async () => {
  const res = await api.get('/products/featured/');
  return res.data;
});

const productSlice = createSlice({
  name: 'products',
  initialState: { products: [], featured: [], categories: [], loading: false, count: 0 },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProducts.fulfilled, (state, action) => { 
      state.products = action.payload.results || action.payload;
      state.count = action.payload.count || 0;
      state.loading = false;
    })
    .addCase(fetchProducts.pending, (state) => { state.loading = true; })
    .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload.results || action.payload; })
    .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload.results || action.payload; });
  },
});
export default productSlice.reducer;
