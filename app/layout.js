export const metadata = {
  title: "Sheets2Maps",
  description: "Excel-connected property map"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script async src={"https://maps.googleapis.com/maps/api/js?key=" + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}></script>
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}