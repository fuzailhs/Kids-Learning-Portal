import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProgressProvider } from "@/components/ProgressProvider";

export const metadata: Metadata = {
  title: {
    default: "Kids Learning Portal",
    template: "%s · Kids Learning Portal",
  },
  description:
    "A safe, child-friendly learning portal with short lessons and five-question practice quizzes for ages 8 to 12.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ProgressProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ProgressProvider>
      </body>
    </html>
  );
}
