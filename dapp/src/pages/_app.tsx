import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { Toaster } from "@/components/ui/toaster";
import type { AppProps } from "next/app";
import "../app/globals.css";
// import localFont from 'next/font/local';

// const inter = localFont({
//   src: '../app/fonts/Inter-VariableFont_slnt,wght.ttf',
//   variable: '--font-sans',
// });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main>
    {/* <main className={`${inter.variable} font-sans`}> */}
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <ReactQueryClientProvider>
          <WalletProvider>
            <Component {...pageProps} />
            <Toaster />
          </WalletProvider>
        </ReactQueryClientProvider>
      </ThemeProvider>
    </main>
  );
} 