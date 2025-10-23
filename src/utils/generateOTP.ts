export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const generateAlphaNumericOTP = (length: number = 6): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    otp += chars[randomIndex];
  }
  return otp;
};
