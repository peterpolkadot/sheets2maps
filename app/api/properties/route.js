import { NextResponse } from "next/server";
import { getExcelRows } from "../../../lib/excel";

export async function GET() {
  try {
    const rows = await getExcelRows();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ 
      error: err.message || err.toString(),
      debug: {
        driveId: process.env.EXCEL_DRIVE_ID ? "SET" : "MISSING",
        fileId: process.env.EXCEL_FILE_ID ? "SET" : "MISSING",
        sheetName: process.env.EXCEL_SHEET_NAME || "MISSING",
        stack: err.stack
      }
    }, { status: 500 });
  }
}