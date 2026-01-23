import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/theme.css'

import { RelationshipProvider } from './context/RelationshipContext'
import ErrorBoundary from './components/ErrorBoundary';
import AnniversaryReveal from './components/AnniversaryReveal';

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
