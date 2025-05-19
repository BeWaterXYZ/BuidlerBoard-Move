// import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Buidlerboard",
  description:
    "Cool-oriented programming.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex justify-center min-h-screen bg-background font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
