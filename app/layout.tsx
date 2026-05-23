import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MEETAYA - Smart Meeting, Smart Action',
  description: 'Manage meetings, minutes of meetings, action items, task tracker, decisions, and monitoring in one premium collaborative workspace.',
  keywords: 'meeting MOM, minutes of meeting, project tracker, task management, collaboration, village meeting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-slate-100`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
