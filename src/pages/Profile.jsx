import { useEffect, useRef, useState } from "react";
import http from "../api/http";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import bgImage from "../assets/hero.jpg";

export default function Profile() {
  const { user, fetchMe } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    grade: "",
  });

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState("");
  const fileRef = useRef(null);

  const fillForm = (data) => {
    setProfile(data);
    setForm({
      name: data?.name || "",
      age: data?.age ?? "",
      grade: data?.grade || "",
    });
    setPreview(data?.profilePic || "");
  };

  const loadProfile = async (mounted = { current: true }) => {
    try {
      if (mounted.current) {
        setLoading(true);
        setMsg(null);
      }

      const res = await http.get("/auth/me");

      if (!mounted.current) return;
      fillForm(res.data);
    } catch (e) {
      if (!mounted.current) return;
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to load profile",
      });
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const mounted = { current: true };
    loadProfile(mounted);

    return () => {
      mounted.current = false;
    };
  }, []);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("age", form.age);
      formData.append("grade", form.grade);

      if (fileRef.current?.files?.[0]) {
        formData.append("profile_image", fileRef.current.files[0]);
      }

      const res = await http.put("/auth/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fillForm(res.data.user);
      setEditing(false);

      if (typeof fetchMe === "function") {
        await fetchMe();
      }

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      setMsg({
        type: "success",
        text: "Profile updated successfully ✅",
      });
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const onCancelEdit = () => {
    setEditing(false);
    setForm({
      name: profile?.name || "",
      age: profile?.age ?? "",
      grade: profile?.grade || "",
    });
    setPreview(profile?.profilePic || "");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const onRefresh = async () => {
    await loadProfile({ current: true });
  };

  if (!user && !loading) return null;

  return (
    <div
      className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-[2px] p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-xl rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                  My Profile 👋
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  View your account details and keep your profile information up to date.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onRefresh}
                  className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
                >
                  Refresh
                </button>

                <button
                  onClick={() => setEditing((prev) => !prev)}
                  className={`px-6 py-3 rounded-2xl text-white font-extrabold transition ${
                    editing
                      ? "bg-slate-600 hover:bg-slate-700"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  {editing ? "Close Edit" : "Edit Profile ✏️"}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <Toast type={msg?.type} text={msg?.text} />
            </div>
          </div>

          {loading ? (
            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-8">
              <Loader label="Loading profile..." />
            </div>
          ) : (
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
              <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-2xl font-black text-slate-900">
                      {profile?.name || "No Name"}
                    </h3>
                    <p className="text-slate-600 mt-1 break-all">
                      {profile?.email}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Badge kind="role">{profile?.role || "-"}</Badge>
                    <Badge kind={profile?.isVerified ? "verified" : "unverified"}>
                      {profile?.isVerified ? "Verified" : "Not Verified"}
                    </Badge>
                    <Badge kind={profile?.isActive ? "active" : "inactive"}>
                      {profile?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard title="User ID" value={String(profile?.user_id ?? "-")} emoji="🆔" />
                  <InfoCard title="Role" value={profile?.role || "-"} emoji="🪪" />
                  <InfoCard title="Verified" value={String(profile?.isVerified)} emoji="✅" />
                  <InfoCard title="Active" value={String(profile?.isActive)} emoji="⚡" />
                  <InfoCard title="Age" value={String(profile?.age ?? "-")} emoji="🎂" />
                  <InfoCard title="Grade" value={profile?.grade || "-"} emoji="📘" />
                </div>
              </div>

              <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
                <h3 className="text-2xl font-black text-slate-900">
                  Profile Details
                </h3>
                <p className="text-slate-600 mt-1">
                  Review your personal information and update it when needed.
                </p>

                {!editing ? (
                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    <DetailField label="Name" value={profile?.name || "-"} />
                    <DetailField label="Email" value={profile?.email || "-"} />
                    <DetailField label="Age" value={String(profile?.age ?? "-")} />
                    <DetailField label="Grade" value={profile?.grade || "-"} />
                    <DetailField
                      label="Created At"
                      value={
                        profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleString()
                          : "-"
                      }
                    />
                    <DetailField label="Profile Image" value={profile?.profilePic || "-"} />
                  </div>
                ) : (
                  <form onSubmit={onSave} className="mt-6 space-y-5">
                    <Field label="Name">
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Enter your name"
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        value={profile?.email || ""}
                        disabled
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
                      />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Age">
                        <input
                          type="number"
                          value={form.age}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, age: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                          placeholder="Enter age"
                        />
                      </Field>

                      <Field label="Grade">
                        <input
                          value={form.grade}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, grade: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                          placeholder="Enter grade"
                        />
                      </Field>
                    </div>

                    <Field label="Profile Picture">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={onPickImage}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm"
                      />
                    </Field>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 disabled:opacity-60 transition"
                      >
                        {saving ? "Saving..." : "Save Changes ✅"}
                      </button>

                      <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ kind, children }) {
  const styles = {
    role: "bg-sky-100 text-sky-700",
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

function InfoCard({ title, value, emoji }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="font-extrabold text-slate-900 mt-1">{title}</div>
      <div className="text-slate-700 break-all">{value}</div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wide font-extrabold text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-900 break-all">{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-extrabold text-slate-800 mb-2">{label}</div>
      {children}
    </label>
  );
}