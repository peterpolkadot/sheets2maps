export const metadata = {
  title: "Catholic Diocese Property Dashboard",
  description: "Interactive property valuation mapping system."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src={
            "https://maps.googleapis.com/maps/api/js?key=" +
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          }
        ></script>

        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* 🔥 REQUIRED GLOBAL INFO WINDOW STYLES */}
        <style>{`
          .gm-style-iw {
            padding: 0 !important;
            max-width: none !important;
          }

          .gm-style-iw-d {
            overflow: auto !important;
            max-height: 500px !important;
          }

          .gm-style-iw-c {
            padding: 0 !important;
            max-width: min(420px, 90vw) !important;
            overflow: visible !important;
          }

          .gm-style .gm-style-iw-t::after {
            display: none !important;
          }

          .iw-header {
            padding: 16px 20px;
            background: linear-gradient(135deg, #006a8e 0%, #008bb3 100%);
          }

          .iw-title {
            margin: 0;
            font-size: 17px;
            font-weight: 700;
            color: white;
          }

          .iw-subtitle {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: rgba(255,255,255,0.9);
            font-weight: 500;
          }

          .iw-building-selector {
            padding: 16px 20px;
            background: #f0f9ff;
            border-bottom: 2px solid #e2e8f0;
          }

          .iw-selector-label {
            font-size: 11px;
            color: #006a8e;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 8px;
            display: block;
          }

          .iw-selector-dropdown {
            width: 100%;
            padding: 10px 12px;
            font-size: 14px;
            font-weight: 600;
            border: 2px solid #006a8e;
            border-radius: 6px;
            background: white;
            cursor: pointer;
          }

          .iw-content {
            padding: 16px;
            background: #fafbfc;
          }

          .building-content { display: none; }
          .building-content.active { display: block; }

          .field-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }

          @media (min-width: 480px) {
            .field-grid {
              grid-template-columns: 1fr 1fr;
            }
          }

          .field-box {
            padding: 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e0f2fe;
          }

          .field-label {
            font-size: 10px;
            color: #006a8e;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 6px;
          }

          .field-value,
          .field-value-large {
            font-size: 13px;
            font-weight: 600;
            color: #000;
          }

          .comments-box {
            margin-top: 16px;
            padding: 14px;
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            border-radius: 6px;
          }

          .comments-label {
            font-size: 10px;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 6px;
          }

          .comments-text {
            font-size: 13px;
            color: #78350f;
          }
        `}</style>
      </head>

      <body style={{ margin: 0, fontFamily: "'Inter', sans-serif", background: "#f8f9fa" }}>
        {children}
      </body>
    </html>
  );
}