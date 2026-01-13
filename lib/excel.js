const fetch = global.fetch;
const { getGraphToken } = require("./graphClient");

function normalizeHeader(h) {
  return String(h || "")
    .replace(/\r|\n/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapRows(headers, rows) {
  const cleanHeaders = headers.map(normalizeHeader);

  return rows.map(r => {
    const obj = {};
    cleanHeaders.forEach((h, i) => {
      obj[h] = r[i];
    });
    return obj;
  });
}

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
  if (!rows.length) return [];

  const headers = rows.shift();
  return mapRows(headers, rows);
}

async function getExcelRows2() {
  const token = await getGraphToken();

  const driveId = process.env.EXCEL_DRIVE_ID_2 || process.env.EXCEL_DRIVE_ID;
  const fileId = process.env.EXCEL_FILE_ID_2 || process.env.EXCEL_FILE_ID;
  const sheet = process.env.EXCEL_SHEET_NAME_2;

  if (!driveId || !fileId || !sheet) {
    return [];
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
    console.log("Graph API error for sheet 2:", json.error);
    return [];
  }

  const rows = json.values || [];
  if (!rows.length) return [];

  const headers = rows.shift();
  return mapRows(headers, rows);
}

module.exports = { getExcelRows, getExcelRows2 };
