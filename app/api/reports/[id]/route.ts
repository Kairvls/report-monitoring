import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { saveFile } from "@/lib/upload";
import path from "path";
import fs from "fs";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reportId = Number(id);

    const formData = await req.formData();

    const file = formData.get("proof_document") as File | null;

    const uploadDir = path.join(process.cwd(), "public/uploads");


    let filePath = null;

    if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = Date.now() + "-" + file.name;
    const fullPath = path.join(uploadDir, fileName);

    fs.writeFileSync(fullPath, buffer);

    filePath = "/uploads/" + fileName;
    }

    await db().query(
      `UPDATE reports SET 
        report_name = ?,
        agency = ?,
        mode_of_submission = ?,
        report_type = ?,
        date_started = ?,
        date_completed = ?,
        deadline = ?,
        date_submitted = ?,
        date_acknowledged = ?,
        proof_document = COALESCE(?, proof_document)
      WHERE id = ?`,
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
        filePath, // ✅ only updates if new file
        reportId,
      ]
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE (NEW)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const reportId = Number(id);

    if (!reportId || isNaN(reportId)) {
      return NextResponse.json(
        { error: "Invalid Id received" },
        { status: 400 }
      );
    }

    const [result]: any = await db().query(
      `DELETE FROM reports WHERE id = ?`,
      [reportId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.log("DELETE ERROR:", err);

    return NextResponse.json(
      {
        error: "Delete failed",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
