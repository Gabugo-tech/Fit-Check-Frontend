import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and prevent generic cross-origin "Script error." which is typical of proxy environments or browser extensions from bubbling up
if (typeof window !== 'undefined') {
  // Silence via window.onerror by returning true
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const isScriptError = 
      message === 'Script error.' || 
      (typeof message === 'string' && message.toLowerCase().includes('script error')) ||
      !source;
      
    if (isScriptError) {
      console.warn('Interdicted generic cross-origin or extension Script error:', message, source);
      return true; // Stop event propagation and prevent default logging
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    const isScriptError = 
      event.message === 'Script error.' || 
      (event.message && event.message.toLowerCase().includes('script error')) ||
      !event.filename;

    if (isScriptError) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('Interdicted generic cross-origin or extension Script error via event listener:', event);
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason) {
      const reasonStr = String(event.reason.message || event.reason);
      if (reasonStr.toLowerCase().includes('script error')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn('Interdicted generic unhandled promise rejection Script error:', event.reason);
      }
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

