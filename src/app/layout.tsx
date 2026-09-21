import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/src/components/Themes/ThemeProvider";

export const metadata: Metadata = {
  title: "AI-Lifehub Project",
  description: "Task Management and more",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-sans">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
