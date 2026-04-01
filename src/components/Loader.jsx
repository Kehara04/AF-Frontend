export default function Loader({ label = "Loading..." }) {
    return (
      <div className="flex items-center gap-3 text-slate-700 font-semibold">
        <span className="inline-block h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
        {label}
      </div>
    );
  }