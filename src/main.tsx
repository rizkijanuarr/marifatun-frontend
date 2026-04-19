import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './presentation/components/Toast/ToastProvider';
import App from './App';
import { I18nProvider } from './presentation/components/i18n/I18nProvider';

/* style.css hides the whole document until this class exists (vanilla partials flow).
   SPA has no include.js — ensure body is visible even if index.html omits the class. */
document.body.classList.add('partials-ready');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </I18nProvider>
  </StrictMode>,
);
