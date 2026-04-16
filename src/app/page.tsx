import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function IndexPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Root redirect logic
  if (!session) {
    redirect("/login");
  } else {
    redirect("/dashboard");
  }
}
