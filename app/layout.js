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
          /* GOOGLE MAPS POPUP – PROFESSIONAL NEUTRAL THEME */

.gm-style-iw {
  padding: 0 !important;
  max-width: none !important;
}

.gm-style-iw-d {
  overflow: hidden !important;
}

.gm-style-iw-c {
  padding: 0 !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
  background: #ffffff !important;
  border: 1px solid #e5e7eb !important;
}

.gm-style .gm-style-iw-t::after {
  display: none !important;
}

.gm-style-iw-c {
  animation: fadeInPopup 0.25s ease-out;
}

@keyframes fadeInPopup {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

        `}</style>
      </head>

      <body style={{ margin: 0, fontFamily: "'Inter', sans-serif", background: "#f8f9fa" }}>
        {children}
      </body>
    </html>
  );
}