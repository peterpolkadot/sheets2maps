import { NextResponse } from "next/server";
import { getExcelRows } from "../../../../lib/excel";

export async function GET() {
  try {
    const rows = await getExcelRows();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.toString() }, { status: 500 });
  }
}