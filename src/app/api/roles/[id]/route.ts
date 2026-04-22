import { createClient } from "@/lib/supabase/server";
import { elevenlabs } from "@/lib/elevenlabs/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: role, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  return NextResponse.json(role);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Remove fields that shouldn't be updated directly
  delete body.id;
  delete body.created_at;
  delete body.created_by;
  delete body.elevenlabs_agent_id;
  delete body.shareable_link;
  delete body.status;

  const { data: role, error } = await supabase
    .from("roles")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(role);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the role to get the ElevenLabs agent ID before deleting
  const { data: role } = await supabase
    .from("roles")
    .select("elevenlabs_agent_id")
    .eq("id", id)
    .single();

  // Delete the agent from ElevenLabs if it exists
  if (role?.elevenlabs_agent_id) {
    try {
      await elevenlabs.conversationalAi.agents.delete(role.elevenlabs_agent_id);
    } catch (e) {
      console.warn("Failed to delete ElevenLabs agent:", e);
    }
  }

  const { error } = await supabase.from("roles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
