import prisma from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import extractFromXML from "@/functions/util/extractFromXML";
import { DocumentType } from "@prisma/client";
var AdmZip = require("adm-zip");

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), "uploads", "faturalar");
const tempsDir = path.join(process.cwd(), "uploads", "faturalar", "temp");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(tempsDir)) {
  fs.mkdirSync(tempsDir, { recursive: true });
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({});
  form.uploadDir = tempsDir;
  form.keepExtensions = true;
  form.multiples = false;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "File upload error" });
    }

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
          user: {
            connect: {
              id: req.headers["x-user-id"],
            },
          },
          type: DocumentType.FATURA,
          year: data.belgeYili.toString(),
          description: data.aciklama,
          uploadCompleted: false,
        },
      });

      const zipFile = files.file[0];
      console.log(zipFile.filepath);
      if (!zipFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      // zipi çıkart ve entryleri al
      const zip = new AdmZip(zipFile.filepath);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        if (
          !entry.isDirectory &&
          entry.entryName.toLowerCase().endsWith(".xml") &&
          !entry.entryName.startsWith("__MACOSX") &&
          !path.basename(entry.entryName).startsWith("._")
        ) {
          // eğer entry xml ise önce file adını düzenle
          const fileName = `${savedDocument.id}_${entry.attr}.xml`;
          const filePath = path.join(uploadsDir, fileName);
          // dosyayı sunucuya(diske ) kaydet
          fs.writeFileSync(filePath, entry.getData());
          // dosyayı oku ve faturadan db'ye kaydedilecek bilgileri extract et, db'ye kaydet.
          const xmlString = fs.readFileSync(filePath, "utf-8");
          const invoiceData = await extractFromXML(xmlString);
          console.log(invoiceData);
          const createdInvoice = await prisma.invoice.create({
            data: {
              ...invoiceData,
              document: {
                connect: {
                  id: savedDocument.id,
                },
              },
            },
          });
          // sonradan bulabilmek için dosyayı yeniden adlandır
          fs.renameSync(
            filePath,
            path.join(uploadsDir, `${createdInvoice.id}.xml`)
          );
        }
      }
      fs.unlinkSync(files.file[0].filepath);

      await prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          uploadCompleted: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Faturalar başarıyla yüklendi.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  });
}
