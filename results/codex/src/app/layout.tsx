import type { Metadata } from "next";
import { Toaster } from "sonner";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "BizBoard",
  description: "Sales, projects, finance, and HR management dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-body">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
