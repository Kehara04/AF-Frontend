export default function ProgressBar({ value = 0 }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
      <div className="h-3 bg-sky-500" style={{ width: `${v}%` }} />
    </div>
  );
}