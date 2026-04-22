"use client";

import Script from "next/script";

export function CallPanel({ agentId }: { agentId: string }) {
  return (
    <>
      <elevenlabs-convai agent-id={agentId} variant="full" always-expanded="true" />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
      />
    </>
  );
}
