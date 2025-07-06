import bcrypt from "bcryptjs";

export const encryptPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
