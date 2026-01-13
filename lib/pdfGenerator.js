import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

export function generatePropertyPDF(propertyData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Header - Blue gradient simulation
  doc.setFillColor(0, 106, 142);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AVR CONSULTING', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Property Valuation Report', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(9);
  const today = new Date().toLocaleDateString('en-AU', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  doc.text(`Generated: ${today}`, pageWidth / 2, 33, { align: 'center' });
  
  let yPos = 50;
  
  // Property Details Section
  doc.setTextColor(0, 106, 142);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Details', 14, yPos);
  
  doc.setDrawColor(0, 106, 142);
  doc.setLineWidth(0.5);
  doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
  
  yPos += 10;
  
  const propertyDetails = [
    ['Site Name', propertyData.siteName],
    ['Building Name', propertyData.buildingName || 'N/A'],
    ['Entity', propertyData.entity || 'N/A'],
    ['Address', propertyData.address]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: propertyDetails,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 70 },
      1: { textColor: [0, 0, 0], halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { left: 14, right: 14 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Valuation Information Section
  doc.setTextColor(0, 106, 142);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Valuation Information', 14, yPos);
  
  doc.setDrawColor(0, 106, 142);
  doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
  
  yPos += 10;
  
  // Highlighted key values
  const keyValuationData = [
    ['Recommended Sum Insured', propertyData.recommendedSumInsured],
    ['Reinstatement Cost', propertyData.reinstatementCost]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: keyValuationData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 5,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { textColor: [0, 106, 142], cellWidth: 70 },
      1: { textColor: [0, 106, 142], halign: 'right' }
    },
    rowStyles: {
      fillColor: [224, 242, 254]
    },
    margin: { left: 14, right: 14 }
  });
  
  yPos = doc.lastAutoTable.finalY + 5;
  
  const valuationDetails = [
    ['Total Cost Inflation Provision', propertyData.inflationProvision],
    ['Demolition & Removal of Debris', propertyData.demolitionCost],
    ['Date of Valuation', propertyData.dateOfValuation]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: valuationDetails,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 70 },
      1: { textColor: [0, 0, 0], halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { left: 14, right: 14 }
  });
  
  // Complete Property Data
  if (propertyData.allData) {
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setTextColor(0, 106, 142);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Complete Property Data', 14, yPos);
    
    doc.setDrawColor(0, 106, 142);
    doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
    
    yPos += 10;
    
    const allDataEntries = Object.entries(propertyData.allData || {});
    const allDataRows = allDataEntries.map(([key, value]) => {
      const displayValue = value === 0 || value === null || value === undefined ? 'N/A' : String(value);
      return [key, displayValue];
    });
    
    doc.autoTable({
      startY: yPos,
      head: [],
      body: allDataRows,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 80 },
        1: { textColor: [0, 0, 0], halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { left: 14, right: 14 }
    });
  }
  
  // Footer on last page
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    
    doc.text(
      'This report was generated from the AVR Consulting Property Dashboard',
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
    
    doc.setFontSize(8);
    doc.text(
      `© ${new Date().getFullYear()} AVR Consulting. All rights reserved.`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  // Return base64 PDF
  return doc.output('datauristring').split(',')[1];
}