import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { store } from './store';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
    <Toaster position="top-right" toastOptions={{
      style: { borderRadius: '12px', fontFamily: 'Inter', fontSize: '14px' },
      success: { style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' } },
      error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' } },
    }} />
  </Provider>
);
