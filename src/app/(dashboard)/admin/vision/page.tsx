import { getCeoVisionReport } from "@/features/reporting/actions/vision-actions";
import { VisionClient } from "./VisionClient";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isManagerOrAbove } from "@/core/auth/roles";

export default async function VisionPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || !isManagerOrAbove(profile.role)) {
    redirect("/dashboard");
  }

  const report = await getCeoVisionReport(30);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <VisionClient initialData={report} />
    </div>
  );
}
