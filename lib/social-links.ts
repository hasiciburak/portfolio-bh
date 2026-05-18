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

/**
 * Single source of truth for profile URLs (footer pill, hero strip, Projects page).
 * Replace `"#"` with your live links; use mailto:you@example.com for Email.
 */
export const SITE_SOCIAL_LINKS: readonly SiteSocialLink[] = [
  { id: "linkedIn", label: "LinkedIn", href: "#" },
  { id: "instagram", label: "Instagram", href: "#" },
  { id: "github", label: "GitHub", href: "#" },
  { id: "email", label: "Email", href: "#" }, // e.g. mailto:hello@example.com
  { id: "whatsapp", label: "WhatsApp", href: "#" },
];
