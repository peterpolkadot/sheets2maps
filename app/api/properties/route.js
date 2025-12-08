
import { getExcelRows } from "@/lib/excel";

export async function GET() {
  const rows = await getExcelRows();
  return Response.json(rows);
}
