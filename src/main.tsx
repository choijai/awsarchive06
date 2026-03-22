import { createRoot } from 'react-dom/client';
import App from './web-app';
import { LocaleProvider } from './LocaleContext';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <LocaleProvider>
      <App />
    </LocaleProvider>
  );
}
