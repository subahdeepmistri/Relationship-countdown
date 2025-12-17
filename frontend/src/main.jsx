import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/theme.css'

import { RelationshipProvider } from './context/RelationshipContext'
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RelationshipProvider>
        <App />
      </RelationshipProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
