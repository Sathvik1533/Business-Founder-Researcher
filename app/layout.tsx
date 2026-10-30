import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Business Radar // Hyderabad — MSME Intelligence',
  description: 'Continuous local radar identifying newly opened businesses, cafes, boutiques, and brands across Hyderabad.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-clay-canvas text-clay-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
