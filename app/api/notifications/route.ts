import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows] = await db.query(
    "SELECT * FROM notifications ORDER BY created_at DESC"
  );

  return NextResponse.json(rows);
}