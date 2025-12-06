import "./globals.css";

export const metadata = {
  title: "Zero Ego AI",
  description: "Zenith Decision",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
