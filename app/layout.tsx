import type { Metadata } from "next";
import "@/index.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Workflow Pro",
  description: "Experience My India workflow tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
