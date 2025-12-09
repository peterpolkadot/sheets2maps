export const metadata = {
  title: "Sheets2Maps - Property Valuation Map",
  description: "Interactive property valuation mapping system"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script async src={"https://maps.googleapis.com/maps/api/js?key=" + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          .gm-style-iw {
            padding: 0 !important;
          }
          .gm-style-iw-d {
            overflow: visible !important;
            max-height: none !important;
          }
          .gm-style-iw-c {
            padding: 0 !important;
            max-width: 500px !important;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', sans-serif", background: "#f8f9fa" }}>{children}</body>
    </html>
  );
}