import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found! Make sure your index.html contains <div id="root"></div>');
}

// Create React root and render the app
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
