
// Layout für alle darunter liegenden Seiten Dark Mode könnte auch hier eingebaut werden
import "./globals.css"; // braucht man für tailwind

export default function RootLayout({ // exportieren des Root Layouts, NextJS erwartet darin children
  children,}: Readonly<{
  children: React.ReactNode; // das ist der Inhalt der Seiten, die dieses Layout benutzt, Next.js fügt automatisch die Seiten ein, die gerade aufgerufen werden
}>) {
  return ( // HTML Grundstruktur
    <html lang="en">
      <body
      >
        {children} {/*Eigentlich Seiten inhalt*/}
      </body>
    </html>
  );
}
