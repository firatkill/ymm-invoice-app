import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

// rediste tutulan total/processed bilgisini getirme. bu sayede yüklenme yüzdesi gösterilecek
export default async function handler(req, res) {
  const { id } = req.query;

  const [total, processed] = await redis.mget(
    `doc:${id}:total`,
    `doc:${id}:processed`
  );

  if (!total || !processed) {
    const document = await prisma.document.findUnique({
      where: {
        id: id,
      },
      select: { uploadCompleted: true },
    });

    return res
      .status(404)
      .json({
        success: false,
        uploadCompleted: document.uploadCompleted,
        error: "No progress info",
      });
  }

  return res.status(200).json({
    success: true,
    total: parseInt(total),
    processed: parseInt(processed),
    percentage: Math.floor((processed / total) * 100),
  });
}
