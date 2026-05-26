import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ FIX HERE

    const [result]: any = await db().query(
      "UPDATE notifications SET is_read = 1 WHERE id = ?",
      [id]
    );

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.log("NOTIFICATION UPDATE ERROR:", err);

    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}
