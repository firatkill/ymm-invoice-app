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
    const { documentId } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
        documentId: documentId,
      },
    });

    const mukellef = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      include: {
        mukellef: true,
      },
    });

    const response = {
      success: true,
      invoices: invoices,
      mukellef: mukellef,
      message: "Faturaları getirme işlemi başarılı",
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Faturaları getirme işlemi sırasında bir hata oluştu",
      message: "Faturaları getirme sırasında bir hata oluştu",
    });
  }
};

export default handler;
