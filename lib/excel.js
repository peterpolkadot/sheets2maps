const fetch = global.fetch;
const { getGraphToken } = require("./graphClient");

async function getExcelRows() {
  const token = await getGraphToken();

  const driveId = process.env.EXCEL_DRIVE_ID;
  const fileId = process.env.EXCEL_FILE_ID;
  const sheet = process.env.EXCEL_SHEET_NAME;

  if (!driveId || !fileId || !sheet) {
    throw new Error("Missing Excel config");
  }

  const url =
    "https://graph.microsoft.com/v1.0/drives/" +
    driveId +
    "/items/" +
    fileId +
    "/workbook/worksheets('" +
    sheet +
    "')/usedRange(valuesOnly=true)?$select=values";

  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + token }
  });

  const json = await res.json();
  
  if (json.error) {
    throw new Error("Graph API error: " + JSON.stringify(json.error));
  }
  
  const rows = json.values || [];

  if (rows.length === 0) return [];

  const headers = rows.shift();
  return rows.map(r => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i]));
    return obj;
  });
}

module.exports = { getExcelRows };