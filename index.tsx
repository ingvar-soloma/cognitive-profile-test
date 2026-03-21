import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { logger } from './services/LoggingService';

registerSW({ immediate: true });

// Setup global error handlers for non-React/async errors
logger.setupGlobalHandlers();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={clientId}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);