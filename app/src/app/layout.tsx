import { Providers } from './providers';

export const metadata = {
  title: 'Builder Board',
  description: 'Discover and support outstanding developers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 