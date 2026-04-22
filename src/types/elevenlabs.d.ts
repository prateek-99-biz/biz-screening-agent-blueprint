import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "agent-id"?: string;
        variant?: string;
        "always-expanded"?: string;
        "default-expanded"?: string;
        "avatar-orb-color-1"?: string;
        "avatar-orb-color-2"?: string;
        "override-config"?: string;
        "dynamic-variables"?: string;
        [key: string]: unknown;
      };
    }
  }
}