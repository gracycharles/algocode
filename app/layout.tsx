import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Algocube: 3x3 & 5x5 Speedcubing Masterclass',
  description: "Interactive 3D animated algorithm trainer for 3x3, 4x4, and 5x5 Rubik's cubes with tactile haptic mechanics, British voice narration, screen keep-awake, and beginner-to-advanced step breakdown.",
  openGraph: {
    title: 'Algocube: 3x3 & 5x5 Speedcubing Masterclass',
    description: "Interactive 3D animated algorithm trainer for 3x3, 4x4, and 5x5 Rubik's cubes with tactile haptic mechanics, British voice narration, screen keep-awake, and beginner-to-advanced step breakdown.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Algocube: 3x3 & 5x5 Speedcubing Masterclass',
    description: "Interactive 3D animated algorithm trainer for 3x3, 4x4, and 5x5 Rubik's cubes with tactile haptic mechanics, British voice narration, screen keep-awake, and beginner-to-advanced step breakdown.",
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#06090e] text-slate-100 antialiased min-h-screen selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
