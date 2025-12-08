export const metadata = {
  title: "Sheets2Maps",
  description: "Single page mockup"
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}