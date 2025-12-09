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
            max-width: min(600px, 90vw) !important;
            max-height: 500px !important;
            overflow: visible !important;
          }

          .gm-style .gm-style-iw-t::after {
            display: none !important;
          }

          /* InfoWindow Styles */
          .iw-header {
            padding: 20px 24px;
            background: linear-gradient(135deg, #006a8e 0%, #008bb3 100%);
            border-bottom: none;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0, 106, 142, 0.15);
          }

          .iw-title {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: white;
            letter-spacing: -0.3px;
            line-height: 1.3;
          }

          .iw-subtitle {
            margin: 6px 0 0 0;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 500;
            line-height: 1.4;
          }

          .iw-building-selector {
            padding: 18px 24px;
            background: linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 100%);
            border-bottom: 1px solid #bae6fd;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 1px 3px rgba(0, 106, 142, 0.08);
          }

          .iw-selector-label {
            font-size: 11px;
            color: #006a8e;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.8px;
            margin-bottom: 10px;
            display: block;
          }

          .iw-selector-dropdown {
            width: 100%;
            padding: 12px 14px;
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
            background: white;
            border: 2px solid #006a8e;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            outline: none;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .iw-content {
            padding: 20px 24px 24px 24px;
            background: linear-gradient(to bottom, #f8fcff 0%, #f0f9ff 100%);
            overflow-y: auto;
          }

          @media (min-width: 640px) {
            .iw-content {
              padding: 24px 28px 28px 28px;
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
            gap: 14px;
            margin-bottom: 20px;
          }

          @media (min-width: 480px) {
            .field-grid {
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
          }

          .field-box {
            padding: 14px 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0f2fe;
            box-shadow: 0 1px 3px rgba(0, 106, 142, 0.06);
          }

          .field-box-highlight {
            padding: 16px 18px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fcff 100%);
            border-radius: 8px;
            border: 2px solid #006a8e;
            box-shadow: 0 2px 6px rgba(0, 106, 142, 0.12);
          }

          .field-label {
            font-size: 10px;
            color: #006a8e;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.6px;
            margin-bottom: 8px;
            line-height: 1.2;
          }

          .field-value {
            color: #1e293b;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.4;
          }

          .field-value-large {
            color: #0f172a;
            font-size: 16px;
            font-weight: 700;
            line-height: 1.3;
          }

          .section-divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #bae6fd, transparent);
            margin: 24px 0;
          }

          .comments-box {
            margin-top: 20px;
            padding: 16px 18px;
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
          }

          .comments-label {
            font-size: 11px;
            color: #92400e;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.6px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .comments-text {
            font-size: 13px;
            color: #78350f;
            line-height: 1.6;
            font-weight: 500;
          }
        `}</style>
      </head>

      <body style={{ margin: 0, fontFamily: "'Inter', sans-serif", background: "#f8f9fa" }}>
        {children}
      </body>
    </html>
  );
}