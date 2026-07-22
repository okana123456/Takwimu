import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Takwimu",
  description: "Role-based programme data, resources, reporting, and M&E platform."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
