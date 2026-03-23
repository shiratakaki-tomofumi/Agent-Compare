import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizBoard - 業務管理ダッシュボード",
  description: "営業・案件・財務・人事を一元管理する業務管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
