import { Worker } from "bullmq";
import redis from "../lib/redis/index.js";
import prisma from "../lib/prisma/index.js";
import fs from "fs";
import path from "path";
import extractFromXML from "../functions/util/extractFromXML.js";

const uploadsDir = path.join(process.cwd(), "uploads", "faturalar");

new Worker(
  "invoice-processing",
  async (job) => {
    const { filePath, documentId } = job.data;

    try {
      // xml'i kaydedilen dosyadan oku
      const xmlString = fs.readFileSync(filePath, "utf-8");
      const invoiceData = await extractFromXML(xmlString);

      //db'ye önemli verileri kaydet
      const createdInvoice = await prisma.invoice.create({
        data: {
          ...invoiceData,
          document: { connect: { id: documentId } },
        },
      });

      // dosyayı daha sonra id ile rahatça bulabilmek için yeniden adlandır
      fs.renameSync(
        filePath,
        path.join(uploadsDir, `${createdInvoice.id}.xml`)
      );
      // rediste processed'i 1 arttır
      await redis.incr(`doc:${documentId}:processed`);

      const [total, processed] = await redis.mget(
        `doc:${documentId}:total`,
        `doc:${documentId}:processed`
      );

      // processed == total ise completed olarak işaretle
      if (parseInt(processed) === parseInt(total)) {
        await prisma.document.update({
          where: { id: documentId },
          data: { uploadCompleted: true },
        });

        // eğer process %100 olmuşsa  kaydı sil
        await redis.del(
          `doc:${documentId}:total`,
          `doc:${documentId}:processed`
        );
      }
    } catch (err) {
      if (job.attemptsMade >= 2) {
        await prisma.failedInvoice.create({
          data: {
            documentId,
            fileName: path.basename(filePath),
            reason: err.message,
          },
        });
        fs.existsSync(filePath) && fs.unlinkSync(filePath);
      }
      throw err;
    }
  },
  {
    connection: { host: "localhost", port: 6379 },
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  }
);
