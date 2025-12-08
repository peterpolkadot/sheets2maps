export const metadata = {
  title: "Sheets2Maps",
  description: "Excel-connected property map"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}