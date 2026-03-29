import { createRoot } from 'react-dom/client';
import App from './web-app';
import { LocaleProvider } from './LocaleContext';
import { ThemeProvider } from './ThemeContext';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>
  );
}
