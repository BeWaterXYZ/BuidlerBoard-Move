import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body className="flex justify-center min-h-screen bg-background antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 