import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Install transparent API authorization interceptor
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const isApiUrl = typeof input === 'string'
        ? input.startsWith('/api/') || input.includes('/api/')
        : input instanceof URL
          ? input.pathname.startsWith('/api/')
          : false;

      if (isApiUrl) {
        const headers = new Headers(init?.headers || {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init = { ...init, headers };
      }
    }
    return originalFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

