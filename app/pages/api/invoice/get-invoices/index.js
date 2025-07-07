import prisma from "@/lib/prisma";

const handler = async (req, res) => {
  if (!req) {
    return res.status(400).json({ error: "Bad Request" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { documentId, search, type, order, page = 1, limit = 10 } = req.query;

    if (!documentId) {
      return res.status(400).json({ error: "Document ID is required" });
    }

    // Build where clause
    const whereClause = {
      documentId: documentId,
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        {
          invoiceNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          supplierName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customerName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          supplierTaxNumber: {
            contains: search,
          },
        },
        {
          customerTaxNumber: {
            contains: search,
          },
        },
      ];
    }

    // Add type filter
    if (type) {
      whereClause.invoiceTypeCode = type;
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const totalInvoices = await prisma.invoice.count({
      where: whereClause,
    });

    // Get invoices with pagination, sorting, and filtering
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: {
        issueDate: order === "asc" ? "asc" : "desc",
      },
      skip: skip,
      take: limitNumber,
    });

    // Get mukellef information
    const mukellef = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      include: {
        mukellef: true,
      },
    });

    const totalPages = Math.ceil(totalInvoices / limitNumber);

    const response = {
      success: true,
      invoices: invoices,
      mukellef: mukellef,
      totalInvoices: totalInvoices,
      totalPages: totalPages,
      currentPage: pageNumber,
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
