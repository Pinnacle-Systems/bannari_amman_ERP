/**
 * Strict Invoice Edit Window Helper
 * 
 * Rules:
 * - Invoices can only be edited on the day they are created or the next calendar day.
 * - E.g. Created on 23rd -> Editable on 23rd and 24th; Blocked on 25th onwards.
 * - Calculation uses whole calendar day difference based on server's time.
 *   This is tamper-proof against client system date/clock changes.
 */
export function checkInvoiceEditWindow(createdAt) {
  if (!createdAt) return { isEditAllowed: true, diffDays: 0 };

  const created = new Date(createdAt);
  const now = new Date();

  // Strip time components to compare calendar days
  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = today.getTime() - createdDay.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Allowed if created today (0) or yesterday (1). Disallowed if diffDays > 1.
  const isEditAllowed = diffDays <= 1;

  return {
    isEditAllowed,
    diffDays,
  };
}
