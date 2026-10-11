import Image from "next/image";
import { Badge, FormSubmitButton } from "../ui";
import type { ProviderId } from "@/lib/auth/providers/types";
import { PROVIDER_UI } from "./providerUi";

interface ProviderButtonProps {
  provider: ProviderId;
  lastUsed: boolean;
  /** The server action with this button's provider already bound. */
  action: () => Promise<void>;
}

/**
 * A provider's sign-in button, one form per provider so each has its own pending state. Every
 * button is full width and the same height, so none looks secondary (Google's prominence rule).
 * "Last used" is a small pill pinned to the button's top-right corner, outside the layout flow
 * (prds/google-oauth-identity-linking.md §5.6.1).
 */
export function ProviderButton({ provider, lastUsed, action }: ProviderButtonProps) {
  const { variant, text, mark } = PROVIDER_UI[provider];
  return (
    <form action={action} className="relative w-full">
      <FormSubmitButton
        variant={variant}
        fullWidth
        icon={
          mark && (
            // unoptimized: the official pixels are served as-is, never re-encoded.
            <Image src={mark.src} width={mark.width} height={mark.height} alt="" unoptimized className="h-5 w-auto" />
          )
        }
      >
        {text}
      </FormSubmitButton>
      {lastUsed && (
        // Pinned over the top-right corner like a notification dot, so it takes no layout space
        // and both buttons stay the same size.
        <span className="absolute -top-2 -right-2 z-10 pointer-events-none">
          <Badge tone="contrast" pill>
            Last Used
          </Badge>
        </span>
      )}
    </form>
  );
}
