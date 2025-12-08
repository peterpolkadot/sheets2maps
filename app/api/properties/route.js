import getExcelRows from "../../../lib/excel.js";

export async function GET() {
  const rows = await getExcelRows();
  return Response.json(rows);
}