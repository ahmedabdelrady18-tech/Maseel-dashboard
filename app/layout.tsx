import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Project Dashboard', description: 'Dynamic Excel Project Dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
