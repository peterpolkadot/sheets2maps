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
            max-width: none !important;
            max-height: none !important;
          }

          .gm-style-iw-d {
            overflow: hidden !important;
            max-width: none !important;
            max-height: none !important;
          }

          .gm-style-iw-c {
            padding: 0 !important;
            max-width: 720px !important;
            max-height: none !important;
            overflow: visible !important;
          }

          .gm-style .gm-style-iw-t::after {
            display: none !important;
          }

          /* InfoWindow Styles */
          .iw-header {
            padding: 14px 20px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }

          .iw-title {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.2px;
          }

          .iw-subtitle {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #475569;
            font-weight: 500;
          }

          .iw-tabs {
            display: flex;
            gap: 0;
            border-bottom: 2px solid #e2e8f0;
            background: #f8fafc;
          }

          .iw-tab {
            flex: 1;
            padding: 14px 20px;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
            transition: all 0.2s;
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .iw-tab.active {
            background: white;
            color: #3b82f6;
            border-bottom-color: #3b82f6;
          }

          .iw-tab:not(.active) {
            background: #f8fafc;
            color: #64748b;
          }

          .iw-tab:not(.active):hover {
            background: #f1f5f9;
          }

          .iw-content {
            padding: 22px;
          }

          .building-content {
            display: none;
          }

          .building-content.active {
            display: block;
          }

          .field-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 16px;
          }

          .field-box {
            padding: 12px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }

          .field-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .field-value {
            color: #0f172a;
            font-size: 13px;
            font-weight: 600;
          }

          .field-value-large {
            color: #0f172a;
            font-size: 14px;
            font-weight: 600;
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