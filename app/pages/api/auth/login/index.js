import prisma from "@/lib/prisma";
import * as yup from "yup";
import { comparePasswords } from "@/functions/util/encryptPassword";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Geçerli bir email giriniz")
    .required("Email gereklidir."),
  password: yup.string().required("Şifre gereklidir."),
});

const handler = async (req, res) => {
  if (!req) {
    return res.status(400).json({ error: "Bad Request" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const data = JSON.parse(req.body);
    await loginSchema.validate(data, { abortEarly: true });

    // Kullanıcıyı email ile bul
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Email veya şifre hatalı",
        message: "Email veya şifre hatalı",
      });
    }

    // Şifre kontrolü
    const isValidPassword = await comparePasswords(
      data.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "şifre hatalı",
        message: "şifre hatalı",
      });
    }

    // Hassas bilgileri çıkar
    const { password, ...userWithoutPassword } = user;

    const response = {
      success: true,
      user: userWithoutPassword,
      message: "Giriş işlemi başarılı",
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        success: false,
        error: "Bilgiler eksik veya hatalı",
        message: "Bilgiler eksik veya hatalı",
        validationErrors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Giriş işlemi sırasında bir hata oluştu",
      message: "Giriş işlemi sırasında bir hata oluştu",
    });
  }
};

export default handler;
