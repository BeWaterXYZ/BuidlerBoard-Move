'use client';

import { WalletProvider } from '@razorlabs/razorkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@razorlabs/razorkit/style.css';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </QueryClientProvider>
  );
} 