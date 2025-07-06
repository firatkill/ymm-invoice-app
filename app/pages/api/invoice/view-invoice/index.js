import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename || !filename.endsWith(".xml")) {
    return res.status(400).send("Geçersiz dosya adı");
  }

  const filePath = path.join(process.cwd(), "uploads", "faturalar", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Dosya bulunamadı");
  }

  const xmlContent = fs.readFileSync(filePath, "utf-8");

  res.setHeader("Content-Type", "application/xml");
  return res.status(200).send(xmlContent);
}
