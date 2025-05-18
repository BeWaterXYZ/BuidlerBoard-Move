import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <style>{`
          #__next {
            width: 100%;
          }
        `}</style>
      </Head>
      <body className="flex justify-center min-h-screen bg-background antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 