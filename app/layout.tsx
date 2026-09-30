import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PHC Pulse Register Parser | Public Health Supply Chain',
  description: 'AI co-pilot and public health register parser for Primary Health Centres across federated health supply chains, converting messy registers, bed sheets, and voice notes into structured verified records.',
  openGraph: {
    title: 'PHC Pulse Register Parser | Public Health Supply Chain',
    description: 'AI co-pilot and public health register parser for Primary Health Centres across federated health supply chains, converting messy registers, bed sheets, and voice notes into structured verified records.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PHC Pulse Register Parser | Public Health Supply Chain',
    description: 'AI co-pilot and public health register parser for Primary Health Centres across federated health supply chains, converting messy registers, bed sheets, and voice notes into structured verified records.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-teal-500/20 selection:text-teal-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
