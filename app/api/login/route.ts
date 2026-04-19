import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const [rows]: any = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  const user = rows[0];

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id },
    "secret_key_reports_monitoring",
    { expiresIn: "1d" }
  );

  return Response.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: "Admin", // for now static
    },
  });
}