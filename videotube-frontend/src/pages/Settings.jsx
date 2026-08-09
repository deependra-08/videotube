import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../api/users";
import { apiErrorMessage } from "../utils/format";
import PasswordInput from "../components/PasswordInput";

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
      <h2 className="mb-4 text-sm font-medium text-(--color-muted)">{title}</h2>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, refreshUser } = useAuth();

  const [details, setDetails] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
  });
  const [detailsStatus, setDetailsStatus] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [coverFile, setCoverFile] = useState(null);
  const [coverStatus, setCoverStatus] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setDetailsError("");
    setDetailsStatus("");
    setSavingDetails(true);
    try {
      await updateAccountDetails(details);
      await refreshUser();
      setDetailsStatus("Saved ✓");
    } catch (err) {
      setDetailsError(apiErrorMessage(err, "Could not save changes"));
    } finally {
      setSavingDetails(false);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setAvatarStatus("");
    try {
      await updateAvatar(avatarFile);
      await refreshUser();
      setAvatarFile(null);
      setAvatarStatus("Avatar updated ✓");
    } catch (err) {
      setAvatarStatus(apiErrorMessage(err, "Could not update avatar"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverSubmit = async (e) => {
    e.preventDefault();
    if (!coverFile) return;
    setUploadingCover(true);
    setCoverStatus("");
    try {
      await updateCoverImage(coverFile);
      await refreshUser();
      setCoverFile(null);
      setCoverStatus("Cover image updated ✓");
    } catch (err) {
      setCoverStatus(apiErrorMessage(err, "Could not update cover image"));
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordStatus("");
    setSavingPassword(true);
    try {
      await changePassword(passwords);
      setPasswords({ oldPassword: "", newPassword: "" });
      setPasswordStatus("Password updated ✓");
    } catch (err) {
      setPasswordError(apiErrorMessage(err, "Could not change password"));
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 py-6">
      <h1 className="font-(family-name:--font-display) text-2xl">Settings</h1>

      <SectionCard title="Profile details">
        <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm text-(--color-muted)">Full name</label>
            <input
              required
              value={details.fullname}
              onChange={(e) => setDetails({ ...details, fullname: e.target.value })}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-(--color-muted)">Email</label>
            <input
              required
              type="email"
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
            />
          </div>
          {detailsError && <p className="text-sm text-(--color-danger)">{detailsError}</p>}
          {detailsStatus && <p className="text-sm text-(--color-accent)">{detailsStatus}</p>}
          <button
            type="submit"
            disabled={savingDetails}
            className="self-start rounded-full bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-bg) disabled:opacity-60"
          >
            {savingDetails ? "Saving…" : "Save details"}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Avatar">
        <div className="mb-3 flex items-center gap-3">
          <img src={user.avatar} alt="" className="h-14 w-14 rounded-full object-cover ring-1 ring-(--color-border)" />
        </div>
        <form onSubmit={handleAvatarSubmit} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            className="text-sm text-(--color-muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--color-surface-2) file:px-3 file:py-1.5 file:text-(--color-ink)"
          />
          <button
            type="submit"
            disabled={!avatarFile || uploadingAvatar}
            className="rounded-full border border-(--color-border) px-4 py-2 text-sm disabled:opacity-60"
          >
            {uploadingAvatar ? "Uploading…" : "Update avatar"}
          </button>
        </form>
        {avatarStatus && <p className="mt-2 text-sm text-(--color-accent)">{avatarStatus}</p>}
      </SectionCard>

      <SectionCard title="Cover image">
        {user.coverImage && (
          <img src={user.coverImage} alt="" className="mb-3 h-24 w-full rounded-lg object-cover" />
        )}
        <form onSubmit={handleCoverSubmit} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="text-sm text-(--color-muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--color-surface-2) file:px-3 file:py-1.5 file:text-(--color-ink)"
          />
          <button
            type="submit"
            disabled={!coverFile || uploadingCover}
            className="rounded-full border border-(--color-border) px-4 py-2 text-sm disabled:opacity-60"
          >
            {uploadingCover ? "Uploading…" : "Update cover"}
          </button>
        </form>
        {coverStatus && <p className="mt-2 text-sm text-(--color-accent)">{coverStatus}</p>}
      </SectionCard>

      <SectionCard title="Change password">
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm text-(--color-muted)">Current password</label>
            <PasswordInput
              required
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-(--color-muted)">New password</label>
            <PasswordInput
              required
              minLength={8}
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          {passwordError && <p className="text-sm text-(--color-danger)">{passwordError}</p>}
          {passwordStatus && <p className="text-sm text-(--color-accent)">{passwordStatus}</p>}
          <button
            type="submit"
            disabled={savingPassword}
            className="self-start rounded-full bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-bg) disabled:opacity-60"
          >
            {savingPassword ? "Updating…" : "Change password"}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
