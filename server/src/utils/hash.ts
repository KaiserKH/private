import bcrypt from "bcryptjs";

export const hashSecret = (value: string) => bcrypt.hash(value, 12);
export const compareSecret = (value: string, hash: string) => bcrypt.compare(value, hash);
