import { getExpenses } from "@/features/finance/actions/expense-actions";
import { ExpenseClient } from "./ExpenseClient";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <ExpenseClient initialExpenses={expenses} />
    </div>
  );
}
