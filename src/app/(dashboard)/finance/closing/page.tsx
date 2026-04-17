import { ClosingClient } from "./ClosingClient";

export const dynamic = "force-dynamic";

export default function ClosingPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-10 px-4 sm:px-6">
      <ClosingClient />
    </div>
  );
}
