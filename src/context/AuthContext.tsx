import { ClerkProvider } from '@clerk/clerk-react';
import type { ReactNode } from 'react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Demo mode flag - when Clerk key is missing, we run in demo mode
const isDemoMode = !PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'your_publishable_key_here';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // If in demo mode, render children directly without Clerk
  if (isDemoMode) {
    console.warn('Running in DEMO MODE - Clerk authentication is not configured. Set VITE_CLERK_PUBLISHABLE_KEY to enable authentication.');
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
}

// Export demo mode flag for use in other components
export { isDemoMode };
