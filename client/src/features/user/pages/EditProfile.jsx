import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCamera, FiCheck, FiX } from "react-icons/fi"; // ✅ removed unused FiLoader
import MainLayout from "../../../components/MainLayout";
import Backbtn from "../../../components/Backbtn";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { api } from "../../api"; // ✅ adjust path if needed

// ─── Avatar Picker ───────────────────────────────────────────────
const AvatarPicker = ({ preview, currentPic, onChange }) => {
  const fileRef = useRef(null);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div
        className="relative cursor-pointer group"
        onClick={() => fileRef.current?.click()}
      >
        <img
          src={preview || currentPic || "/default-avatar.png"}
          alt="avatar"
          onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }} // ✅ fallback
          className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-400 transition"
        />
        <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <FiCamera size={20} className="text-white" />
        </div>
      </div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition"
      >
        Change profile photo
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          e.target.value = "";
        }}
      />
    </div>
  );
};

// ─── Username status indicator ────────────────────────────────────
const UsernameStatus = ({ status }) => {
  if (status === "idle")      return null;
  if (status === "checking")  return <p className="text-xs text-gray-400 flex items-center gap-1"><span className="animate-spin inline-block">⏳</span> Checking…</p>;
  if (status === "same")      return <p className="text-xs text-gray-400">This is your current username.</p>;
  if (status === "available") return <p className="text-xs text-green-500 flex items-center gap-1"><FiCheck size={12} /> Username is available</p>;
  if (status === "taken")     return <p className="text-xs text-red-400 flex items-center gap-1"><FiX size={12} /> Username already taken</p>;
  return null;
};

// ─── Form Field ──────────────────────────────────────────────────
const FormField = ({ label, name, value, onChange, placeholder, multiline, maxLength, children }) => {
  const baseClass =
    "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name} name={name} value={value} onChange={onChange}
          placeholder={placeholder} maxLength={maxLength} rows={3}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          id={name} type="text" name={name} value={value} onChange={onChange}
          placeholder={placeholder} maxLength={maxLength}
          className={baseClass}
        />
      )}
      {children}
      {maxLength && (
        <p className={`text-xs text-right transition ${
          (value?.length ?? 0) >= maxLength ? "text-red-400" : "text-gray-400"
        }`}>
          {value?.length ?? 0} / {maxLength}
        </p>
      )}
    </div>
  );
};

// ─── Save Button ─────────────────────────────────────────────────
const SaveButton = ({ loading, disabled }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition ${
      loading || disabled
        ? "bg-blue-300 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600 active:scale-95"
    }`}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Saving…
      </span>
    ) : "Save changes"}
  </button>
);

// ─── Fields config — ✅ city removed ─────────────────────────────
const FIELDS = [
  { label: "Name",     name: "name",     placeholder: "Your full name",              maxLength: 50  },
  { label: "Username", name: "username", placeholder: "username",                    maxLength: 30  },
  { label: "Bio",      name: "bio",      placeholder: "Tell people about yourself…", maxLength: 150, multiline: true },
  { label: "College",  name: "college",  placeholder: "Your college or university",  maxLength: 80  },
];

// ─── Main Page ───────────────────────────────────────────────────
const EditProfile = () => {
  const navigate  = useNavigate();
  const { user, setUser }    = useAuth();
  const { editProfile, loading } = useUser();

  const [avatarFile,     setAvatarFile]     = useState(null);
  const [avatarPreview,  setAvatarPreview]  = useState(null);
  const [success,        setSuccess]        = useState(false);
  const [isSaving,       setIsSaving]       = useState(false); // ✅ local save state
  const [usernameStatus, setUsernameStatus] = useState("idle");

  const [formData, setFormData] = useState({
    name: "", username: "", bio: "", college: "", // ✅ city removed
  });

  const debounceRef = useRef(null);

  // ✅ pre-fill form once user loads
  useEffect(() => {
    if (!user) return;
    setFormData({
      name:     user.name     ?? "",
      username: user.username ?? "",
      bio:      user.bio      ?? "",
      college:  user.college  ?? "",  // ✅ city removed
    });
  }, [user]);

  // ✅ debounced username availability check
  const checkUsername = useCallback((username) => {
    clearTimeout(debounceRef.current);
    const trimmed = username.trim().toLowerCase();

    if (trimmed.length < 2) { setUsernameStatus("idle"); return; }
    if (trimmed === user?.username?.toLowerCase()) { setUsernameStatus("same"); return; }

    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/check-username/${trimmed}`);
        setUsernameStatus(res.data?.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
  }, [user?.username]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "username") checkUsername(value);
  };

  const handleAvatarChange = (file) => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!formData.username.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }
    if (usernameStatus === "taken") {
      toast.error("That username is already taken.");
      return;
    }
    if (usernameStatus === "checking") {
      toast.error("Please wait while we check username availability.");
      return;
    }

    setIsSaving(true); // ✅ local save loading — independent of context loading
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val.trim()));
      if (avatarFile) data.append("profilePic", avatarFile);

      const res = await editProfile(data);
      if (res?.user) setUser(res.user);
      setSuccess(true);
      setTimeout(() => navigate(`/${formData.username}`), 1200);
    } catch {
      // interceptor toast already shown
    } finally {
      setIsSaving(false);
    }
  };

  const isSubmitBlocked = usernameStatus === "taken" || usernameStatus === "checking";

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50">

        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center">
          <Backbtn />
          <span className="text-sm font-semibold text-gray-800 absolute left-1/2 -translate-x-1/2">
            Edit profile
          </span>
        </div>

        <div className="max-w-lg mx-auto px-5 sm:px-10 pb-16">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            <AvatarPicker
              preview={avatarPreview}
              currentPic={user?.profilePic}
              onChange={handleAvatarChange}
            />

            <div className="border-t border-gray-200" />

            {FIELDS.map((field) => (
              <FormField
                key={field.name}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
              >
                {field.name === "username" && (
                  <UsernameStatus status={usernameStatus} />
                )}
              </FormField>
            ))}

            {success && (
              <div className="flex items-center justify-center gap-1.5 text-sm text-green-500 font-medium">
                <FiCheck size={15} /> Profile updated!
              </div>
            )}

            <SaveButton loading={isSaving} disabled={isSubmitBlocked} />

          </form>
        </div>

      </main>
    </MainLayout>
  );
};

export default EditProfile;