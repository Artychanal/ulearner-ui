import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppProviders from "@/components/Providers/AppProviders";
import "./globals.css";


export const metadata: Metadata = {
  title: "ULearner - Online Courses",
  description: "Learn anything, anytime.",
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
