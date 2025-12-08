import getGraphToken from "./graph.js";

export default async function getExcelRows() {
  const token = await getGraphToken();

  const driveId = process.env.EXCEL_DRIVE_ID;
  const fileId = process.env.EXCEL_FILE_ID;
  const sheet = process.env.EXCEL_SHEET_NAME;

  const url = \`https://graph.microsoft.com/v1.0/drives/\${driveId}/items/\${fileId}/workbook/worksheets('\${sheet}')/usedRange(valuesOnly=true)?$select=values\`;

  const res = await fetch(url, {
    headers: { Authorization: \`Bearer \${token}\` }
  });

  const json = await res.json();
  const rows = json.values || [];

  const headers = rows.shift();
  return rows.map(r =>
    Object.fromEntries(headers.map((h, i) => [h, r[i]]))
  );
}