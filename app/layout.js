export const metadata = {
  title: "Sheets2Maps",
  description: "Excel to Map Viewer"
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "sans-serif" }}>
        {children}
      </body>
    </html>
  );
}