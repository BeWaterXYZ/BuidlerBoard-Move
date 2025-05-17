// import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { PropsWithChildren } from "react";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Scaffold-Move",
  description:
    "🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Move Chains.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex justify-center min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          // hint: set the default theme here.
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
      </body>
    </html>
  );
}
