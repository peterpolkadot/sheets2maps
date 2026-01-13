import { NextResponse } from "next/server";
import { sendEmailWithAttachment } from "../../../lib/graphClient";
import { generatePropertyPDF } from "../../../lib/pdfGenerator";

export async function POST(req) {
  try {
    const body = await req.json();
    const { recipientEmail, propertyData } = body;

    if (!recipientEmail || !propertyData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Format date if it's an Excel serial number
    function formatDateValue(value) {
      if (!value) return "N/A";
      if (typeof value === 'string' && value.includes('/')) return value;
      if (typeof value === 'number') {
        const utc_days = Math.floor(value - 25569);
        const utc_value = utc_days * 86400;
        const date = new Date(utc_value * 1000);
        return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return value;
    }

    const formattedDate = formatDateValue(propertyData.dateOfValuation);

    // Generate PDF (returns base64 string)
    const pdfBase64 = generatePropertyPDF(propertyData);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Inter', Arial, sans-serif; 
            background: #f8f9fa; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.6;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #006a8e 0%, #008bb3 100%); 
            padding: 30px; 
            color: white; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
          }
          .header p { 
            margin: 8px 0 0 0; 
            font-size: 14px; 
            opacity: 0.9; 
          }
          .content { 
            padding: 30px; 
          }
          .section { 
            margin-bottom: 30px; 
          }
          .section-title { 
            font-size: 18px; 
            color: #006a8e; 
            font-weight: 700; 
            margin-bottom: 16px; 
            padding-bottom: 8px; 
            border-bottom: 2px solid #e0f2fe; 
          }
          .field-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 14px; 
            background: #f8f9fa; 
            margin-bottom: 10px; 
            border-radius: 6px;
            gap: 20px;
            align-items: flex-start;
          }
          .field-label { 
            font-weight: 600; 
            color: #64748b; 
            font-size: 13px;
            flex: 0 0 45%;
            display: block;
          }
          .field-value { 
            color: #000; 
            font-weight: 600; 
            font-size: 13px;
            text-align: right;
            flex: 1;
            word-break: break-word;
            display: block;
          }
          .attachment-notice {
            background: #fef3c7;
            padding: 16px;
            border-radius: 6px;
            border-left: 4px solid #f59e0b;
            margin-top: 20px;
          }
          .attachment-notice p {
            margin: 0;
            color: #92400e;
            font-size: 13px;
            font-weight: 600;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #64748b; 
            font-size: 12px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AVR CONSULTING</h1>
            <p>Property Report</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">Property Details</div>
              <div class="field-row">
                <span class="field-label">Site Name</span>
                <span class="field-value">${propertyData.siteName}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Building Name</span>
                <span class="field-value">${propertyData.buildingName || 'N/A'}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Entity</span>
                <span class="field-value">${propertyData.entity || 'N/A'}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Address</span>
                <span class="field-value">${propertyData.address}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Date of Valuation</span>
                <span class="field-value">${formattedDate}</span>
              </div>
            </div>

            <div class="attachment-notice">
              <p>📎 A detailed PDF report with complete property information is attached to this email.</p>
            </div>
          </div>

          <div class="footer">
            <p>This report was generated from the AVR Consulting Property Dashboard</p>
            <p>© ${new Date().getFullYear()} AVR Consulting. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmailWithAttachment(
      recipientEmail,
      `Property Report - ${propertyData.siteName}`,
      htmlContent,
      {
        filename: `Property_Report_${propertyData.siteName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        content: pdfBase64,
        contentType: 'application/pdf'
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: err.message || err.toString() }, { status: 500 });
  }
}