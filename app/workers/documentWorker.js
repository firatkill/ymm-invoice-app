import { Worker } from "bullmq";
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";
import redis from "../lib/redis/index.js";
import { invoiceQueue } from "../lib/queues/invoiceQueue.js";

const uploadsDir = path.join(process.cwd(), "uploads", "faturalar");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
new Worker(
  "document-processing",
  async (job) => {
    const { zipFilePath, savedDocumentId } = job.data;
    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip
      .getEntries()
      .filter(
        (entry) =>
          !entry.isDirectory &&
          entry.entryName.toLowerCase().endsWith(".xml") &&
          !entry.entryName.startsWith("__MACOSX") &&
          !path.basename(entry.entryName).startsWith("._")
      );

    // Redis'te sayaç başlat
    await redis.set(`doc:${savedDocumentId}:total`, zipEntries.length);
    await redis.set(`doc:${savedDocumentId}:processed`, 0);

    const jobPromises = [];
    for (const entry of zipEntries) {
      const filePath = path.join(
        uploadsDir,
        `${savedDocumentId}_${path.basename(entry.entryName)}`
      );
      fs.writeFileSync(filePath, entry.getData());
      const job = await invoiceQueue.add("process-invoice", {
        filePath,
        documentId: savedDocumentId,
      });
      const completion = job.waitUntilFinished();
      jobPromises.push(completion);
    }

    // Tüm job'lar tamamlandığında zip dosyasını sil
    Promise.all(jobPromises)
      .then(() => {
        fs.unlinkSync(zipFilePath);
        console.log("Tüm işler tamamlandı, zip silindi.");
      })
      .catch((err) => {
        console.error("Job'lar işlenirken hata oluştu:", err);
      });
  },
  { connection: { host: "localhost", port: 6379 } }
);
