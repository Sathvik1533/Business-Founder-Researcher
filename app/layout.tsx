import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Business Radar Hyderabad | Discover Newly Opened Businesses',
  description: 'Automated intelligence radar detecting new businesses, cafes, boutiques, and brands launching across Hyderabad every 8 hours.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
