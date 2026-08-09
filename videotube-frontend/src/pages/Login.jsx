import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../utils/format";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const isEmail = form.identifier.includes("@");
      await login({
        password: form.password,
        ...(isEmail ? { email: form.identifier } : { username: form.identifier }),
      });
      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not sign in"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl">Welcome back</h1>
        <p className="mt-1 text-sm text-(--color-muted)">Sign in to keep watching.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Username or email</label>
          <input
            required
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Password</label>
          <PasswordInput
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-(--color-danger)">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-(--color-accent) py-2.5 text-sm font-medium text-(--color-bg) transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-(--color-muted)">
        New here?{" "}
        <Link to="/register" className="text-(--color-accent)">
          Create an account
        </Link>
      </p>
    </div>
  );
}