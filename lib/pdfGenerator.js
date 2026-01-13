const PDFDocument = require('pdfkit');

function formatCurrency(value) {
  if (!value || value === 0 || value === "$-" || value === "-") return "Not yet valued";
  if (typeof value === 'string' && value.startsWith('$')) return value;
  return "$" + value.toLocaleString();
}

function excelDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return null;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info;
}

function formatDate(value) {
  if (!value) return "N/A";
  if (typeof value === 'string' && value.includes('/')) return value;
  const date = excelDateToJSDate(value);
  if (!date) return "N/A";
  return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function generatePropertyPDF(propertyData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header with gradient effect (simulated with rectangles)
    doc.rect(0, 0, doc.page.width, 120).fill('#006a8e');
    
    doc.fontSize(28)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text('AVR CONSULTING', 50, 35, { align: 'center' });
    
    doc.fontSize(14)
       .fillColor('#ffffff')
       .font('Helvetica')
       .text('Property Valuation Report', 50, 70, { align: 'center' });
    
    doc.fontSize(11)
       .fillColor('#ffffff')
       .text(`Generated: ${new Date().toLocaleDateString('en-AU', { 
         day: '2-digit', 
         month: 'long', 
         year: 'numeric' 
       })}`, 50, 90, { align: 'center' });

    let yPos = 150;

    // Property Details Section
    doc.fontSize(16)
       .fillColor('#006a8e')
       .font('Helvetica-Bold')
       .text('Property Details', 50, yPos);
    
    yPos += 10;
    doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#006a8e');
    yPos += 20;

    const propertyDetails = [
      { label: 'Site Name', value: propertyData.siteName },
      { label: 'Building Name', value: propertyData.buildingName || 'N/A' },
      { label: 'Entity', value: propertyData.entity || 'N/A' },
      { label: 'Address', value: propertyData.address }
    ];

    propertyDetails.forEach((item, index) => {
      // Alternating background
      if (index % 2 === 0) {
        doc.rect(50, yPos - 5, 495, 25).fill('#f8f9fa');
      }
      
      doc.fontSize(10)
         .fillColor('#64748b')
         .font('Helvetica-Bold')
         .text(item.label, 60, yPos, { width: 200 });
      
      doc.fontSize(10)
         .fillColor('#000000')
         .font('Helvetica')
         .text(item.value, 280, yPos, { width: 255, align: 'right' });
      
      yPos += 25;
    });

    yPos += 20;

    // Valuation Information Section
    doc.fontSize(16)
       .fillColor('#006a8e')
       .font('Helvetica-Bold')
       .text('Valuation Information', 50, yPos);
    
    yPos += 10;
    doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#006a8e');
    yPos += 20;

    // Highlighted key values
    const keyValues = [
      { label: 'Recommended Sum Insured', value: propertyData.recommendedSumInsured },
      { label: 'Reinstatement Cost', value: propertyData.reinstatementCost }
    ];

    keyValues.forEach(item => {
      doc.rect(50, yPos - 5, 495, 30).fill('#e0f2fe');
      doc.rect(50, yPos - 5, 4, 30).fill('#006a8e');
      
      doc.fontSize(11)
         .fillColor('#006a8e')
         .font('Helvetica-Bold')
         .text(item.label, 60, yPos + 5, { width: 250 });
      
      doc.fontSize(12)
         .fillColor('#006a8e')
         .font('Helvetica-Bold')
         .text(item.value, 320, yPos + 5, { width: 215, align: 'right' });
      
      yPos += 35;
    });

    const valuationDetails = [
      { label: 'Total Cost Inflation Provision', value: propertyData.inflationProvision },
      { label: 'Demolition & Removal of Debris', value: propertyData.demolitionCost },
      { label: 'Date of Valuation', value: propertyData.dateOfValuation }
    ];

    valuationDetails.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.rect(50, yPos - 5, 495, 25).fill('#f8f9fa');
      }
      
      doc.fontSize(10)
         .fillColor('#64748b')
         .font('Helvetica-Bold')
         .text(item.label, 60, yPos, { width: 250 });
      
      doc.fontSize(10)
         .fillColor('#000000')
         .font('Helvetica')
         .text(item.value, 320, yPos, { width: 215, align: 'right' });
      
      yPos += 25;
    });

    // Add all additional data if available
    if (propertyData.allData) {
      yPos += 30;
      
      // Check if we need a new page
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.fontSize(16)
         .fillColor('#006a8e')
         .font('Helvetica-Bold')
         .text('Complete Property Data', 50, yPos);
      
      yPos += 10;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#006a8e');
      yPos += 20;

      // Convert allData object to array and display all fields
      const allDataEntries = Object.entries(propertyData.allData || {});
      
      allDataEntries.forEach(([key, value], index) => {
        // Check if we need a new page
        if (yPos > 720) {
          doc.addPage();
          yPos = 50;
        }
        
        if (index % 2 === 0) {
          doc.rect(50, yPos - 5, 495, 25).fill('#f8f9fa');
        }
        
        doc.fontSize(9)
           .fillColor('#64748b')
           .font('Helvetica-Bold')
           .text(key, 60, yPos, { width: 220 });
        
        const displayValue = value === 0 || value === null || value === undefined ? 'N/A' : String(value);
        
        doc.fontSize(9)
           .fillColor('#000000')
           .font('Helvetica')
           .text(displayValue, 290, yPos, { width: 245, align: 'right' });
        
        yPos += 25;
      });
    }

    // Footer
    const footerY = doc.page.height - 60;
    doc.fontSize(9)
       .fillColor('#94a3b8')
       .font('Helvetica')
       .text('This report was generated from the AVR Consulting Property Dashboard', 50, footerY, { 
         align: 'center',
         width: doc.page.width - 100
       });
    
    doc.fontSize(8)
       .fillColor('#94a3b8')
       .text(`© ${new Date().getFullYear()} AVR Consulting. All rights reserved.`, 50, footerY + 15, { 
         align: 'center',
         width: doc.page.width - 100
       });

    doc.end();
  });
}

module.exports = { generatePropertyPDF };