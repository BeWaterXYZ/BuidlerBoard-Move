"use client";
import "@/app/globals.css";
import React from "react";
import { Languages } from "@/i18n";
import { Header } from "@/components/header/header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DialogContainer } from "@/components/dialog/dialog-container";
import { Toast } from "@/components/toast/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function RootLayout({
  children,
  params: { lng }
}: {
  children: React.ReactNode;
  params: { lng: Languages };
}) {
  return (
    <html lang={lng}>
      <body>
        <QueryClientProvider client={queryClient}>
          <Header lng={lng} />
          <main>{children}</main>
          <DialogContainer />
          <Toast />
        </QueryClientProvider>
      </body>
    </html>
  );
} 