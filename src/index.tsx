import React from 'react';
import { createRoot } from 'react-dom/client';
// import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Расширяем тип HTMLElement для пользовательского свойства
declare global {
  interface HTMLElement {
    _reactRootContainer?: boolean;
  }
}

// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement
// );
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// import App from './App';

const initializeReact = () => {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        console.warn('Root element not found, skipping React initialization');
        return;
    }
    if (!rootElement._reactRootContainer) {
        console.log('Initializing React root');
        const root = createRoot(rootElement);
        root.render(<App />);
        rootElement._reactRootContainer = true; // Флаг для предотвращения повторного рендера
    } else {
        console.warn('Root element already initialized');
    }
};

const startReact = () => {
    if (document.getElementById('root')) {
        initializeReact();
    } else {
        console.warn('Root element not found, waiting for RootReady event');
        window.addEventListener('RootReady', initializeReact, { once: true });
    }
};

if (document.readyState === 'complete') {
    startReact();
} else {
    window.addEventListener('load', startReact);
}