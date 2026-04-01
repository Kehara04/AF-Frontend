import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import bgImage from "../assets/hero.jpg";

export default function AdminKids() {
  const [kids, setKids] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await http.get("/admin/kids");
      setKids(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to fetch kids",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (kid) => {
    setMsg(null);
    try {
      setBusyId(kid._id);
      await http.patch(`/admin/user/${kid._id}/status`, {
        isActive: !kid.isActive,
      });
      await load();
      setMsg({
        type: "success",
        text: `${kid.isActive ? "Deactivated" : "Activated"} successfully ✅`,
      });
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to update status",
      });
    } finally {
      setBusyId(null);
    }
  };

  const filteredKids = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return kids;

    return kids.filter((k) => {
      const name = (k.name || "").toLowerCase();
      const email = (k.email || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [kids, search]);

  const stats = useMemo(() => {
    const total = kids.length;
    const active = kids.filter((k) => k.isActive).length;
    const inactive = total - active;
    const verified = kids.filter((k) => k.isVerified).length;
    return { total, active, inactive, verified };
  }, [kids]);

  return (
    <div
      className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-[2px] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-xl rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                  Admin Kids Management 👑
                </h2>
                {/* <p className="text-slate-600 mt-2 font-medium">
                  Review kid accounts, search quickly, and activate or deactivate them with a cleaner workflow.
                </p> */}
              </div>

              <button
                onClick={load}
                className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
              >
                Refresh List
              </button>
            </div>

            <div className="mt-4">
              <Toast type={msg?.type} text={msg?.text} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Kids" value={stats.total} />
            <StatCard label="Active" value={stats.active} />
            <StatCard label="Inactive" value={stats.inactive} />
            <StatCard label="Verified" value={stats.verified} />
          </div>

          <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Kids List</h3>
                <p className="text-slate-600 mt-1">
                  Search by child name or email and manage account access cleanly.
                </p>
              </div>

              <div className="w-full md:w-[360px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            {loading ? (
              <div className="mt-8">
                <Loader label="Loading kids..." />
              </div>
            ) : filteredKids.length === 0 ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="text-xl font-black text-slate-900">No kids found</div>
                <div className="text-slate-600 mt-2">
                  {kids.length === 0
                    ? "There are no kid accounts available right now."
                    : "No matching result for your search."}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {filteredKids.map((k) => (
                  <div
                    key={k._id}
                    className="rounded-[28px] border border-slate-200 bg-slate-50/95 p-5 md:p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-xl font-black text-slate-900 truncate">
                            {k.name || "Unnamed Kid"}
                          </div>

                          <Badge kind={k.isVerified ? "verified" : "unverified"}>
                            {k.isVerified ? "Verified" : "Not Verified"}
                          </Badge>

                          <Badge kind={k.isActive ? "active" : "inactive"}>
                            {k.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="mt-3 grid sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm text-slate-700">
                          <InfoPill label="Email" value={k.email || "-"} />
                          <InfoPill label="Name" value={k.name || "-"} />
                          <InfoPill label="Verified" value={String(!!k.isVerified)} />
                          <InfoPill label="Active" value={String(!!k.isActive)} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 lg:justify-end">
                        <button
                          onClick={() => toggleActive(k)}
                          disabled={busyId === k._id}
                          className={`px-5 py-3 rounded-2xl font-extrabold text-white transition disabled:opacity-60 ${
                            k.isActive
                              ? "bg-rose-600 hover:bg-rose-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {busyId === k._id
                            ? "Updating..."
                            : k.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-lg rounded-[28px] p-5">
      <div className="text-sm font-bold text-slate-600">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function Badge({ kind, children }) {
  const styles = {
    verified: "bg-violet-100 text-violet-700",
    unverified: "bg-amber-100 text-amber-700",
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-slate-200 text-slate-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${styles[kind]}`}>
      {children}
    </span>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 min-w-0">
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-800 truncate">{value}</div>
    </div>
  );
}
