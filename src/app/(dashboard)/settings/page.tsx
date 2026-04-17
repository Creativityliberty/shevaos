import { getTenantStatus } from "@/features/settings/actions/settings-actions";
import { SettingsClient } from "@/features/settings/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const tenant = await getTenantStatus();

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      <SettingsClient tenant={tenant} />
    </div>
  );
}
