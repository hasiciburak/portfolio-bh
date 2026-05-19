export type SocialLinkId =
  | "linkedIn"
  | "instagram"
  | "github"
  | "email"
  | "whatsapp";

export interface SiteSocialLink {
  id: SocialLinkId;
  label: string;
  href: string;
}

export const SITE_SOCIAL_LINKS: readonly SiteSocialLink[] = [
  { id: "linkedIn", label: "LinkedIn", href: "https://www.linkedin.com/in/burakhasici/" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/burakhasici/" },
  { id: "github", label: "GitHub", href: "https://github.com/hasiciburak" },
  { id: "email", label: "Email", href: "[EMAIL_ADDRESS]" },
  { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/905353685517" },
];
