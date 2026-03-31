import '../styles/globals.css';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

export const metadata = {
  title: 'DMap - Community Map for Disabled People',
  description: 'Find and rate accessible places in your city.',
};

import ClientProviders from '../components/ClientProviders';

export default function RootLayout({ children }) {
  return (
    <html lang="vi" data-theme="default">
      <body>
        <ClientProviders>
          <AccessibilityToolbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
