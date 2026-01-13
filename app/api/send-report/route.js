import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/graphClient";

export async function POST(req) {
  try {
    const body = await req.json();
    const { recipientEmail, propertyData } = body;

    if (!recipientEmail || !propertyData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #006a8e 0%, #008bb3 100%); padding: 30px; color: white; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
          .content { padding: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; color: #006a8e; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e0f2fe; }
          .field-row { display: flex; justify-content: space-between; padding: 12px; background: #f8f9fa; margin-bottom: 8px; border-radius: 6px; }
          .field-label { font-weight: 600; color: #64748b; font-size: 13px; }
          .field-value { color: #000; font-weight: 600; font-size: 13px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AVR CONSULTING</h1>
            <p>Property Valuation Report</p>
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
            </div>

            <div class="section">
              <div class="section-title">Valuation Information</div>
              <div class="field-row">
                <span class="field-label">Recommended Sum Insured</span>
                <span class="field-value">${propertyData.recommendedSumInsured}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Reinstatement Cost</span>
                <span class="field-value">${propertyData.reinstatementCost}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Total Cost Inflation Provision</span>
                <span class="field-value">${propertyData.inflationProvision}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Demolition & Removal of Debris</span>
                <span class="field-value">${propertyData.demolitionCost}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Date of Valuation</span>
                <span class="field-value">${propertyData.dateOfValuation}</span>
              </div>
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

    await sendEmail(
      recipientEmail,
      `Property Report - ${propertyData.siteName}`,
      htmlContent
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: err.message || err.toString() }, { status: 500 });
  }
}
