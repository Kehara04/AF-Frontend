export default function Toast({ type = "info", text }) {
  if (!text) return null;

  const styles =
    type === "success"
      ? "bg-sky-50 border-sky-200 text-sky-900"
      : type === "error"
        ? "bg-rose-50 border-rose-200 text-rose-900"
        : "bg-sky-50 border-sky-200 text-sky-900";

  return (
    <div className={`border rounded-2xl px-4 py-3 text-sm font-semibold ${styles}`}>
      {text}
    </div>
  );
}