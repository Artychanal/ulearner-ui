import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppProviders from "@/components/Providers/AppProviders";
import "./globals.css";

const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl =
  envSiteUrl && envSiteUrl.length > 0 ? envSiteUrl : "https://ulearner-ui.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ULearner — Online Courses & Career Growth",
    template: "%s | ULearner",
  },
  description:
    "ULearner helps developers, designers, and product professionals master new skills with mentor-led online courses and hands-on projects.",
  keywords: [
    "online courses",
    "elearning",
    "developer bootcamp",
    "design courses",
    "career growth",
    "tech education",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "ULearner — Online Courses & Career Growth",
    description:
      "Join ULearner to access mentor-led courses, community support, and hands-on projects that accelerate your tech career.",
    siteName: "ULearner",
    images: [
      {
        url: "/course-thumbnails/react-state.svg",
        alt: "ULearner mentor-led online courses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ulearner",
    title: "ULearner — Online Courses & Career Growth",
    description:
      "Mentor-led online courses with hands-on projects to accelerate your tech career.",
    images: ["/course-thumbnails/react-state.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "36PbwH4I0faWZ3IWLnYJ-d8JQnZ7hPuOKdDnzo2tk-E",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="d-flex flex-column min-vh-100">
        <AppProviders>
          <Header />
          <main className="flex-grow-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
