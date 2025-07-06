import prisma from "@/lib/prisma";

const handler = async (req, res) => {
  if (!req) {
    return res.status(400).json({ error: "Bad Request" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ekleyen user'ın id sine göre hepsini getir
    const documents = await prisma.document.findMany({
      where: {
        userId: req.headers["x-user-id"],
      },
      include: {
        mukellef: true,
      },
    });

    const response = {
      success: true,
      documents: documents,
      message: "Belgeleri getirme işlemi başarılı",
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Belgeleri getirme işlemi sırasında bir hata oluştu",
      message: "Belgeleri getirme sırasında bir hata oluştu",
    });
  }
};

export default handler;
