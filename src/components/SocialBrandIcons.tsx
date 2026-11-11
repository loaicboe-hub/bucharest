import type { CSSProperties } from "react";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "whatsapp" | "x";

type SocialBrandConfig = {
  label: string;
  style: CSSProperties;
};

export const SOCIAL_BRAND_CONFIG: Record<SocialPlatform, SocialBrandConfig> = {
  facebook: {
    label: "Facebook",
    style: { backgroundColor: "#1877F2" },
  },
  instagram: {
    label: "Instagram",
    style: {
      background:
        "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
    },
  },
  linkedin: {
    label: "LinkedIn",
    style: { backgroundColor: "#0A66C2" },
  },
  whatsapp: {
    label: "WhatsApp",
    style: { backgroundColor: "#25D366" },
  },
  x: {
    label: "X",
    style: { backgroundColor: "#000000" },
  },
};

export function SocialBrandMark({
  platform,
  size = "md",
}: {
  platform: SocialPlatform;
  size?: "sm" | "md";
}) {
  const glyphSize = size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5";

  switch (platform) {
    case "facebook":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-full w-full text-white"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13.874 24v-8.457h2.796l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.514V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.642H7.078v3.47h3.047V24h3.749z" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${size === "sm" ? "h-[19px] w-[19px]" : "h-[21px] w-[21px]"} text-white`}
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3.2"
            y="3.2"
            width="17.6"
            height="17.6"
            rx="5.2"
            stroke="currentColor"
            strokeWidth="2.1"
          />
          <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="2.1" />
          <circle cx="17.2" cy="6.8" r="1.25" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${glyphSize} text-white`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6.44 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM6.5 8.48h-4V21h4V8.48Zm6.32 0H8.84V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21h3.95v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z" />
        </svg>
      );
    case "whatsapp":
      return <WhatsAppIcon className={`${glyphSize} text-white`} />;
    case "x":
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} text-white`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
  }
}
