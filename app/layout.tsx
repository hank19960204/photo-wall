import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Our Memories — Arcadia Bay',
  description: 'A polaroid photo wall inspired by Life is Strange',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
