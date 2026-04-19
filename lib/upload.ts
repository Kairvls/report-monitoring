import fs from "fs";
import path from "path";

export async function saveFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(process.cwd(), "public/uploads", fileName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${fileName}`;
}