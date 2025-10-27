
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM12 1.5v2M12 20.5v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1.5 12h2M20.5 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { authState, logout } = useAuth();
  const { theme, toggleTheme, isReady } = useTheme();
  const isDarkMode = theme === "dark";

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  const favoriteCount = authState.status === "authenticated" ? authState.user.favoriteCourses.length : 0;

  const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/#testimonials", label: "Stories" },
    { href: "/#instructors", label: "Mentors" },
  ];

  return (
    <header className="site-header py-3">
      <div className="container d-flex justify-content-between align-items-center gap-4">
        <Link href="/" className="brand-link">
          <span className="brand-badge">UL</span>
          ULearner
        </Link>
        <nav className="d-flex align-items-center gap-2">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={`nav-link ${pathname === href ? "active" : ""}`}>
              {label}
            </Link>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-ghost px-3 d-flex align-items-center gap-2"
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            disabled={!isReady}
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
            <span className="d-none d-lg-inline">{isDarkMode ? "Light" : "Dark"} mode</span>
          </button>
          {authState.status === "authenticated" ? (
            <>
              <button type="button" className="btn btn-sm btn-ghost px-3" onClick={handleDashboardClick}>
                My dashboard
              </button>
              <Link
                href="/dashboard/favorites"
                className="btn btn-sm btn-ghost position-relative d-inline-flex align-items-center justify-content-center"
                aria-label="Favorite courses"
                title="Favorite courses"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ color: favoriteCount > 0 ? "#dc3545" : "currentColor" }}
                >
                  <path d="M12 21s-6.5-4.35-9.17-8.12C-0.84 7.8 1.14 3 5 3c2.14 0 3.63 1.37 4.5 2.62C10.37 4.37 11.86 3 14 3c3.86 0 5.84 4.8 2.17 9.88C18.5 16.65 12 21 12 21z" />
                </svg>
                {favoriteCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {Math.min(favoriteCount, 99)}
                  </span>
                )}
              </Link>
              <Link href="/dashboard/profile" className="d-flex align-items-center gap-2 text-decoration-none text-reset">
                <Image
                  src={authState.user.avatarUrl || "https://www.gravatar.com/avatar/?d=mp"}
                  alt={authState.user.name}
                  width={32}
                  height={32}
                  className="rounded-pill border"
                />
                <span className="small fw-semibold text-secondary">{authState.user.name}</span>
              </Link>
              <button type="button" className="btn btn-sm btn-primary px-3 rounded-pill" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-sm btn-ghost px-3">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-sm btn-primary px-3 rounded-pill">
                Start for free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
