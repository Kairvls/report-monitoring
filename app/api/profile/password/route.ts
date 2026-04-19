import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = "secret_key_reports_monitoring";

export async function PUT(req: Request) {
  try {
    // ✅ get token
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "No token" });

    const decoded: any = jwt.verify(token, SECRET);

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // ✅ get user
    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE id=?",
      [decoded.id]
    );

    const user = rows[0];

    // ✅ check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // ✅ hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // ✅ update
    await db.query(
      "UPDATE users SET password=? WHERE id=?",
      [hashed, decoded.id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" });
  }
}