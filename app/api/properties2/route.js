import { NextResponse } from "next/server";
import { getExcelRows2 } from "../../../lib/excel";

export async function GET() {
  try {
    const rows = await getExcelRows2();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message || err.toString() }, { status: 500 });
  }
}