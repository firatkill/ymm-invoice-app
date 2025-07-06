import prisma from "@/lib/prisma";
import * as yup from "yup";
import { encryptPassword } from "@/functions/util/encryptPassword";

// yup ile gelen veriyi doğrula, daha sonra kullanıcı var mı diye kontrol et; yoksa şifreyi hashle ve db'ye kaydet. success dön

const registerSchema = yup.object().shape({
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
    const data = req.body;
    await registerSchema.validate(data, { abortEarly: true });

    // Kullanıcıyı email ile bul
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (user) {
      return res.status(401).json({
        success: false,
        error: "Email zaten kullanılıyor",
        message: "Email zaten kullanılıyor",
      });
    }

    // Şifre kontrolü
    const hashedPassword = await encryptPassword(data.password);

    // Kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    const response = {
      success: true,
      message: "Kayıt işlemi başarılı",
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
      error: "Kayıt işlemi sırasında bir hata oluştu",
      message: "Kayıt işlemi sırasında bir hata oluştu",
    });
  }
};

export default handler;
