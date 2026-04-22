import { elevenlabs } from "./client";
import { buildAgentPrompt } from "@/lib/prompt-engine/buildAgentPrompt";
import { RoleConfig } from "@/lib/prompt-engine/types";
import { headers } from "next/headers";

export async function createAgent(
  config: RoleConfig,
  voiceIdOverride?: string
): Promise<{
  agent_id: string;
  shareable_link: string;
}> {
  const systemPrompt = buildAgentPrompt(config);
  const voiceId = voiceIdOverride ?? process.env.ELEVENLABS_DEFAULT_VOICE_ID!;

  // Create the agent
  const agent = await elevenlabs.conversationalAi.agents.create({
    name: `${config.role_title} Screening`,
    conversationConfig: {
      agent: {
        firstMessage: "Hi, thanks for calling Biz Group.",
        language: "en",
        prompt: {
          prompt: systemPrompt,
        },
      },
      tts: {
        voiceId: voiceId,
      },
    },
  });

  // Build the shareable link pointing to our own /talk/ page
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const shareableLink = `${protocol}://${host}/talk/${agent.agentId}`;

  return {
    agent_id: agent.agentId,
    shareable_link: shareableLink,
  };
}
