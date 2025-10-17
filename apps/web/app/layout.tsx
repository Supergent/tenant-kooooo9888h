import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ThemeProvider, ToastProvider } from "@jn789t0cfcgadt5aq7yyv69ab17skn1r/components";

export const metadata: Metadata = {
  title: "Task Manager - AI-Powered Todo List",
  description: "A clean, focused todo list application with AI assistance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
