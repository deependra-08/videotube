import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../utils/format";

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: "", email: "", username: "", password: "" });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!avatar) {
      setError("Please choose an avatar image");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("avatar", avatar);
      if (coverImage) formData.append("coverImage", coverImage);

      await register(formData);
      await login({ username: form.username, password: form.password });
      navigate("/");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create your account"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl">Join videotube</h1>
        <p className="mt-1 text-sm text-(--color-muted)">Create a channel and start sharing.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Full name</label>
          <input
            required
            value={form.fullname}
            onChange={(e) => setForm({ ...form, fullname: e.target.value })}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Username</label>
          <input
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Password</label>
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Avatar</label>
          <input
            required
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-(--color-muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--color-surface-2) file:px-3 file:py-1.5 file:text-(--color-ink)"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Cover image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-(--color-muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--color-surface-2) file:px-3 file:py-1.5 file:text-(--color-ink)"
          />
        </div>

        {error && <p className="text-sm text-(--color-danger)">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-(--color-accent) py-2.5 text-sm font-medium text-(--color-bg) transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-(--color-muted)">
        Already have an account?{" "}
        <Link to="/login" className="text-(--color-accent)">
          Sign in
        </Link>
      </p>
    </div>
  );
}
