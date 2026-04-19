export function formatINR(value) {
  const amount = Number(value || 0);
  return `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;
}
