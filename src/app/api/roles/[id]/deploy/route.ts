import { createClient } from "@/lib/supabase/server";
import { createAgent } from "@/lib/elevenlabs/createAgent";
import { RoleConfig } from "@/lib/prompt-engine/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: role, error: fetchError } = await supabase
      .from("roles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.status === "active") {
      return NextResponse.json({ error: "Role is already deployed" }, { status: 400 });
    }

    const config: RoleConfig = {
      role_title: role.title,
      company_name: role.company_name ?? "Biz Group",
      agent_name: "[AGENT_NAME]",
      call_duration_target: [role.call_duration_min, role.call_duration_max],
      call_hard_limit_minutes: role.call_hard_limit_minutes,
      notice_period_threshold_weeks: role.notice_period_threshold_weeks,
      language_requirements: role.language_requirements ?? "",
      capture_arabic_capability: role.capture_arabic_capability ?? false,
      scenario_questions: role.scenario_questions,
      logic_question: role.logic_question,
      feedback_question: role.feedback_question,
      feedback_probe: role.feedback_probe,
      culture_intro: role.culture_intro,
      culture_statements: role.culture_statements,
      scoring_rubric: role.scoring_rubric,
    };

    const { agent_id, shareable_link } = await createAgent(config, role.voice_id);

    const { data: updatedRole, error: updateError } = await supabase
      .from("roles")
      .update({
        elevenlabs_agent_id: agent_id,
        shareable_link: shareable_link,
        status: "active",
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedRole);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Deployment failed" },
      { status: 500 }
    );
  }
}
