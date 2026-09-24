import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'PlaceholderApp',
  description: 'Our life, in photo dumps, challenges, and plans.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
