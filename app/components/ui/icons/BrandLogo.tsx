export type Brand = "whatsapp" | "linkedin" | "email";

interface BrandLogoProps {
  brand: Brand;
  size?: number;
}

/**
 * Full-colour share-target marks. The fills are each brand's own colour (WhatsApp green,
 * LinkedIn blue), which is why they live here and not as app tokens. Email has no brand,
 * so it gets a neutral tile in the same shape. Decorative: the button names the target.
 */
export function BrandLogo({ brand, size = 22 }: BrandLogoProps) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      {brand === "whatsapp" && (
        <>
          <circle cx="12" cy="12" r="11" fill="#25D366" />
          <path
            d="M7.4 17.4l.8-2.6a5.6 5.6 0 1 1 2.1 2.1z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M10.2 9.6c.2-.4.5-.4.7-.4.2 0 .4.6.5.9.1.2 0 .4-.2.6l-.3.3c.4.8 1 1.4 1.8 1.8l.3-.3c.2-.2.4-.3.6-.2.3.1.9.3.9.5 0 .3 0 .5-.4.8-.4.3-1 .4-1.6.1a5.4 5.4 0 0 1-2.6-2.6c-.3-.6-.1-1.2.3-1.5z"
            fill="#ffffff"
          />
        </>
      )}
      {brand === "linkedin" && (
        <>
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#0A66C2" />
          <rect x="5.5" y="9.5" width="2.8" height="8.5" fill="#ffffff" />
          <circle cx="6.9" cy="6.6" r="1.6" fill="#ffffff" />
          <path
            d="M10.5 9.5h2.7v1.2c.4-.8 1.4-1.4 2.6-1.4 2.2 0 2.7 1.4 2.7 3.3V18h-2.8v-4.6c0-1-.2-1.8-1.2-1.8s-1.3.8-1.3 1.8V18h-2.7z"
            fill="#ffffff"
          />
        </>
      )}
      {brand === "email" && (
        <>
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#525252" />
          <rect x="5" y="7" width="14" height="10" rx="1" fill="none" stroke="#ffffff" strokeWidth="1.4" />
          <path d="M5.5 7.5l6.5 5 6.5-5" fill="none" stroke="#ffffff" strokeWidth="1.4" />
        </>
      )}
    </svg>
  );
}
