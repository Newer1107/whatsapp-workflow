import type { Metadata, Viewport } from "next";
import AppShell from "@/components/AppShell";
import { PortalProvider } from "@/lib/use-portal";
import "./tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riverside Public School — WhatsApp office",
  description:
    "Operations portal for the school WhatsApp number: conversation history, student context, unread backlog, routing and statistics.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#245487",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PortalProvider>
          <AppShell>{children}</AppShell>
        </PortalProvider>
      </body>
    </html>
  );
}
