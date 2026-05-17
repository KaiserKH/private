import bcrypt from "bcryptjs";
export const hashSecret = (value) => bcrypt.hash(value, 12);
export const compareSecret = (value, hash) => bcrypt.compare(value, hash);
