import prisma from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { documentQueue } from "@/lib/queues/documentQueue";
import { DocumentType } from "@prisma/client";

export const config = { api: { bodyParser: false } };

const uploadsDir = path.join(process.cwd(), "uploads", "faturalar");
const tempsDir = path.join(uploadsDir, "temp");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(tempsDir)) {
  fs.mkdirSync(tempsDir, { recursive: true });
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const form = formidable({ uploadDir: tempsDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload error" });

    try {
      const { mukellef, vkn, tckn, adSoyad, aciklama, belgeTuru, belgeYili } =
        fields;

      const data = {
        mukellef: Array.isArray(mukellef) ? mukellef[0] : mukellef,
        vkn: Array.isArray(vkn) ? vkn[0] : vkn,
        tckn: Array.isArray(tckn) ? tckn[0] : tckn,
        adSoyad: Array.isArray(adSoyad) ? adSoyad[0] : adSoyad,
        aciklama: Array.isArray(aciklama) ? aciklama[0] : aciklama,
        belgeTuru: Array.isArray(belgeTuru) ? belgeTuru[0] : belgeTuru,
        belgeYili: parseInt(
          Array.isArray(belgeYili) ? belgeYili[0] : belgeYili
        ),
      };

      const savedDocument = await prisma.document.create({
        data: {
          mukellef: {
            create: {
              mukellef: data.mukellef,
              vkn: data.vkn,
              tckn: data.tckn,
              adSoyad: data.adSoyad,
            },
          },
          user: { connect: { id: req.headers["x-user-id"] } },
          type: DocumentType.FATURA,
          year: data.belgeYili.toString(),
          description: data.aciklama,
          uploadCompleted: false,
        },
      });

      const zipFile = files.file?.[0];
      if (!zipFile) return res.status(400).json({ error: "No file uploaded" });
      console.log(zipFile.filepath);
      try {
        await documentQueue.add("process-document", {
          zipFilePath: zipFile.filepath,
          savedDocumentId: savedDocument.id,
        });

        return res
          .status(200)
          .json({ success: true, documentId: savedDocument.id });
      } catch (queueErr) {
        // Belge oluşturulmuştu, ama iş kuyruğa eklenemedi, temizle
        await prisma.document.delete({
          where: { id: savedDocument.id },
        });

        return res.status(500).json({
          error: "İşlem kuyruğa alınamadı. Lütfen tekrar deneyin.",
        });
      }
    } catch (mainErr) {
      console.error("❌ Belge oluşturulurken hata:", mainErr);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  });
}
