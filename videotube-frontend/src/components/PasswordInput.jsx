import { useState } from "react";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "",
  required = false,
  minLength,
  name,
  id,
  className = "",
  disabled = false,
  autoComplete = "current-password",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        name={name}
        id={id}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 pr-10 text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:border-(--color-accent) focus:outline-none disabled:opacity-60 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
        title={showPassword ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-(--color-muted) hover:text-(--color-ink) focus:outline-none transition-colors"
      >
        {showPassword ? (
          /* Eye Slash Icon (Hide password) */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        ) : (
          /* Eye Icon (Show password) */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
