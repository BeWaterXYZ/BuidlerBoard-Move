import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ReactQueryClientProvider>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </ReactQueryClientProvider>
    </ThemeProvider>
  );
} 