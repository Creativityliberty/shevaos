import { createClient } from "@/lib/supabase/server";
import { CreateCustomerForm } from "@/features/customers/components/CreateCustomerForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewCustomerPage() {
  const supabase = await createClient();

  // Fetch zones for the customer creation dropdown
  const { data: zones } = await supabase
    .from("zones")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm border border-gray-100 h-12 w-12 flex-shrink-0">
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Nouveau <span className="text-primary">Client</span>
          </h1>
          <p className="text-gray-500 font-medium">Ajouter un nouveau profil dans le CRM.</p>
        </div>
      </div>

      <CreateCustomerForm zones={zones || []} />
    </div>
  );
}
