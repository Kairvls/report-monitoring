import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// 📁 ensure upload folder exists
const uploadDir = path.join(process.cwd(), "public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ GET ALL REPORTS
export async function GET() {
  try {
    const [rows] = await db().query(
      "SELECT * FROM reports ORDER BY id DESC"
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.log("GET ERROR:", err);
    return NextResponse.json(
      { error: "Fetch failed" },
      { status: 500 }
    );
  }
}

// ✅ CREATE REPORT (WITH FILE UPLOAD)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 🔹 FILE HANDLING
    const file = formData.get("proof_document") as File | null;

    let filePath: string | null = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const fullPath = path.join(uploadDir, fileName);

      fs.writeFileSync(fullPath, buffer);

      filePath = `/uploads/${fileName}`; // ✅ store this in DB
    }

    // 🔹 INSERT INTO DB
    await db().query(
      `INSERT INTO reports (
        report_name,
        agency,
        mode_of_submission,
        report_type,
        date_started,
        date_completed,
        deadline,
        date_submitted,
        date_acknowledged,
        proof_document,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formData.get("report_name"),
        formData.get("agency"),
        formData.get("mode_of_submission"),
        formData.get("report_type"),
        formData.get("date_started") || null,
        formData.get("date_completed") || null,
        formData.get("deadline") || null,
        formData.get("date_submitted") || null,
        formData.get("date_acknowledged") || null,
        filePath,
        "Pending",
      ]
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.log("POST ERROR:", err);
    return NextResponse.json(
      { error: "Insert failed" },
      { status: 500 }
    );
  }
}
