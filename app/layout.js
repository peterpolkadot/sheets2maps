export const metadata = {
  title: "Catholic Diocese Property Dashboard",
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
            max-width: none !important;
            max-height: none !important;
          }

          .gm-style-iw-d {
            overflow: auto !important;
            max-width: none !important;
            max-height: 500px !important;
          }

          .gm-style-iw-c {
            padding: 0 !important;
            max-width: min(420px, 90vw) !important;
            max-height: 500px !important;
            overflow: visible !important;
          }

          .gm-style .gm-style-iw-t::after {
            display: none !important;
          }

          /* InfoWindow Styles */
          .iw-header {
            padding: 16px 20px;
            background: linear-gradient(135deg, #006a8e 0%, #008bb3 100%);
            border-bottom: none;
            position: sticky;
            top: 0;
            z-index: 10;
          }

          .iw-title {
            margin: 0;
            font-size: 17px;
            font-weight: 700;
            color: white;
            letter-spacing: -0.2px;
          }

          .iw-subtitle {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
          }

          .iw-building-selector {
            padding: 16px 20px;
            background: #f0f9ff;
            border-bottom: 2px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 10;
          }

          .iw-selector-label {
            font-size: 11px;
            color: #006a8e;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
          }

          .iw-selector-dropdown {
            width: 100%;
            padding: 10px 12px;
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
            background: white;
            border: 2px solid #006a8e;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            outline: none;
          }

          .iw-selector-dropdown:hover {
            border-color: #008bb3;
          }

          .iw-content {
            padding: 16px;
            background: #fafbfc;
            overflow-y: auto;
          }

          @media (min-width: 640px) {
            .iw-content {
              padding: 22px;
            }
          }

          .building-content {
            display: none;
          }

          .building-content.active {
            display: block;
          }

          .field-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }

          @media (min-width: 480px) {
            .field-grid {
              grid-template-columns: 1fr 1fr;
              gap: 14px;
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
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .field-value {
            color: #000000;
            font-size: 13px;
            font-weight: 600;
          }

          .field-value-large {
            color: #000000;
            font-size: 14px;
            font-weight: 700;
          }

          .comments-box {
            margin-top: 16px;
            padding: 14px;
            background: #fffbeb;
            border-radius: 6px;
            border-left: 3px solid #f59e0b;
          }

          .comments-label {
            font-size: 10px;
            color: #92400e;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .comments-text {
            font-size: 13px;
            color: #78350f;
            line-height: 1.5;
          }
        `}</style>
      </head>

      <body style={{ margin: 0, fontFamily: "'Inter', sans-serif", background: "#f8f9fa" }}>
        {children}
      </body>
    </html>
  );
}