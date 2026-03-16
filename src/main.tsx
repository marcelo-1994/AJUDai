import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

console.log('Main script executing...');
const root = document.getElementById('root');
console.log('Root element:', root);
createRoot(root!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
