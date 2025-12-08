
import { getExcelRows } from "../../lib/excel";

export default async function handler(req, res) {
  try {
    const rows = await getExcelRows();
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
