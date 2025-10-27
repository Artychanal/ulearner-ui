
import Link from "next/link";
import type { ReactElement } from "react";

const year = new Date().getFullYear();

const footerColumns: Array<{ heading: string; links: Array<{ label: string; href: string }> }> = [
  {
    heading: "Product",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Mentors", href: "/#instructors" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Community", href: "/#testimonials" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/guides" },
      { label: "Help center", href: "/help" },
    ],
  },
];

const socialIcons: Array<{ name: string; href: string; icon: ReactElement }> = [
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.94 7.04a4.84 4.84 0 01-2.3.63 3.82 3.82 0 001.93-2.1 4.88 4.88 0 01-2.53.93 4 4 0 00-6.87 2.72 4.43 4.43 0 00.1.9 11.3 11.3 0 01-8.3-4.2 4.15 4.15 0 00-.57 2 4 4 0 001.79 3.3 3.61 3.61 0 01-1.84-.55v.07a4.08 4.08 0 003.18 3.9 4.05 4.05 0 01-1.8.07 4 4 0 003.67 2.66A8.1 8.1 0 014 18.58 11.3 11.3 0 0016.08 8.31 8.51 8.51 0 0021 6.64a7.68 7.68 0 01-2.06 2.11z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5.2 3.5a1.84 1.84 0 110 3.67 1.84 1.84 0 010-3.67zM4 9h2.4v12H4zm6 0h2.3v1.7h.03a2.52 2.52 0 012.28-1.25c2.44 0 2.89 1.6 2.89 3.68V21H15V13.9c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.78V21H8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21.6 7.2a2.52 2.52 0 00-1.77-1.77C18 5 12 5 12 5s-6 0-7.83.43A2.52 2.52 0 002.4 7.2 26.94 26.94 0 002 12a26.94 26.94 0 00.43 4.8 2.52 2.52 0 001.77 1.77C6 19 12 19 12 19s6 0 7.83-.43a2.52 2.52 0 001.77-1.77A26.94 26.94 0 0022 12a26.94 26.94 0 00-.4-4.8zM10 15.5v-7l6 3.5z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-intro">
            <h3 className="footer-heading h3 fw-bold mb-0">Keep learning with ULearner</h3>
            <p className="footer-subtext small mb-0">
              Join a global community of builders leveling up together with practical courses and guided projects.
            </p>
            <div className="footer-social" role="navigation" aria-label="Social media">
              {socialIcons.map((item) => (
                <Link key={item.name} href={item.href} className="social-button" aria-label={item.name}>
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer-links">
            {footerColumns.map((column) => (
              <div key={column.heading}>
                <h4 className="footer-column-heading fw-semibold text-uppercase mb-3">{column.heading}</h4>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-decoration-none">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="d-flex flex-column gap-3 footer-newsletter">
            <div>
              <h4 className="footer-column-heading fw-semibold text-uppercase mb-2">Stay in the loop</h4>
              <p className="footer-subtext small mb-0">
                Subscribe to receive new course launches and free workshop invites.
              </p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2" role="form" aria-label="Newsletter subscription">
              <label htmlFor="email" className="visually-hidden">
                Email
              </label>
              <input id="email" type="email" className="form-control form-control-lg border-light" placeholder="you@example.com" />
              <button type="button" className="btn btn-light px-4">
                Subscribe
              </button>
            </div>
            <p className="footer-subtext small mb-0">One update per month. No spam—unsubscribe anytime.</p>
          </div>
        </div>

        <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 small">
          <span>&copy; {year} ULearner. All rights reserved.</span>
          <div className="d-flex gap-3">
            <Link href="/privacy" className="text-decoration-none">
              Privacy
            </Link>
            <Link href="/terms" className="text-decoration-none">
              Terms
            </Link>
            <Link href="/cookies" className="text-decoration-none">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
