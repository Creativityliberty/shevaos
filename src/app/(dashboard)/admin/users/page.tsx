import { getUsers } from "@/features/users/actions/user-actions";
import { UserListClient } from "@/features/users/components/UserListClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      <UserListClient initialUsers={users} />
    </div>
  );
}
