/**
 * Sponsors & Partners Data Configuration
 * The Shield Showdown - Season 2
 * 
 * To add, remove, or modify sponsors:
 * - `name`: The display name of the sponsor/company
 * - `logo`: Path or URL to the logo image (SVG, PNG, or WebP). Use contain aspect ratio.
 * - `category`: Partnership tier / classification (e.g. "OFFICIAL PARTNER", "GOLD PARTNER", "MEDIA PARTNER", "TECH PARTNER")
 * - `website`: Optional URL to open when the sponsor card is clicked
 * - `description`: Short optional tagline / description
 */

export const sponsorsData = [
  {
    id: "zupiter-np",
    name: "Zupiter Nepal",
    logo: "/sponsors/zupiter.png",
    category: "OFFICIAL PARTNER",
    website: "https://www.instagram.com/zupiter.np?igsh=YXlmOW9nMHJzbGY3",
    tagline: "Nepal's Premier Gaming Gear & Accessories",
    tier: "official"
  }
];

export default sponsorsData;
