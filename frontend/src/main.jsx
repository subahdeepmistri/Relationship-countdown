import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/theme.css'

import { RelationshipProvider } from './context/RelationshipContext'
import ErrorBoundary from './components/ErrorBoundary';
import AnniversaryReveal from './components/AnniversaryReveal';

// Recover from stale-deploy chunk failures: if the service worker updated
// while an old tab was open, lazily-imported chunks may 404. One reload
// picks up the new precached build.
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault();
  const KEY = 'rc_chunk_reload';
  if (sessionStorage.getItem(KEY)) return; // avoid reload loops
  sessionStorage.setItem(KEY, '1');
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AnniversaryReveal>
        <RelationshipProvider>
          <App />
        </RelationshipProvider>
      </AnniversaryReveal>
    </ErrorBoundary>
  </React.StrictMode>,
)
