import prisma from "@/lib/prisma";

const handler = async (req, res) => {
  if (!req) {
    return res.status(400).json({ error: "Bad Request" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { search, type, order, page = 1, limit = 10 } = req.query;

    // Build where clause
    const whereClause = {
      userId: req.headers["x-user-id"],
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        {
          mukellef: {
            mukellef: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          year: {
            contains: search,
          },
        },
      ];
    }

    // Add type filter
    if (type) {
      whereClause.type = type;
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const totalDocuments = await prisma.document.count({
      where: whereClause,
    });

    // Get documents with pagination, sorting, and filtering
    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        mukellef: true,
      },
      orderBy: {
        createdAt: order === "asc" ? "asc" : "desc",
      },
      skip: skip,
      take: limitNumber,
    });

    const totalPages = Math.ceil(totalDocuments / limitNumber);

    const response = {
      success: true,
      documents: documents,
      totalDocuments: totalDocuments,
      totalPages: totalPages,
      currentPage: pageNumber,
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
