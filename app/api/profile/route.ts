import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = "secret_key_reports_monitoring";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded: any = jwt.verify(token, SECRET);

    const [rows]: any = await db.query(
      "SELECT id, username, full_name, email, avatar, role FROM users WHERE id=?",
      [decoded.id]
    );

    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded: any = jwt.verify(token, SECRET);

    const formData = await req.formData();

    const full_name = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const avatarFile = formData.get("avatar") as File | null;

    let avatarBase64 = null;

    // 🖼️ HANDLE IMAGE
    if (avatarFile && avatarFile.size > 0) {
      // basic validation (image only)
      if (!avatarFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files allowed" },
          { status: 400 }
        );
      }

      // convert to base64
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      avatarBase64 = `data:${avatarFile.type};base64,${buffer.toString("base64")}`;
    }

    // 🧠 UPDATE QUERY
    await db.query(
      `
      UPDATE users 
      SET full_name = ?, email = ?, 
      avatar = COALESCE(?, avatar)
      WHERE id = ?
      `,
      [full_name, email, avatarBase64, decoded.id]
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}