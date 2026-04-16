import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginCustomer = createAsyncThunk('auth/loginCustomer', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/customer/login/', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const loginAdmin = createAsyncThunk('auth/loginAdmin', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/admin/login/', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('access_token'),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginCustomer.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.access) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          localStorage.setItem('access_token', action.payload.access);
          localStorage.setItem('refresh_token', action.payload.refresh);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginCustomer.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginAdmin.pending, (state) => { state.loading = true; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('access_token', action.payload.access);
        localStorage.setItem('refresh_token', action.payload.refresh);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginAdmin.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
