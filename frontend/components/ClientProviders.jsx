'use client';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

function AuthModalManager() {
  const { showAuthModal, setShowAuthModal } = useAuth();
  if (!showAuthModal) return null;
  return <AuthModal onClose={() => setShowAuthModal(false)} />;
}

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      {children}
      <AuthModalManager />
    </AuthProvider>
  );
}
