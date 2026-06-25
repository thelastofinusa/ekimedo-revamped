export const siteConfig = {
  title: "Ekimedo Atelier",
  tagline: "Where luxury meets timeless designs",
  description:
    "Custom Bridals dresses, Robes and evening Gowns for your special occasions!",
  author: {
    fullName: "Eki Ajibade",
    fName: "Eki",
    lName: "Ajibade",
    nickname: "Ekimedo",
  },
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_SITE_URL!,
  supportEmail: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
};
