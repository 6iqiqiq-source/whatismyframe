/**
 * 클라이언트 프로바이더 래퍼
 *
 * ThemeProvider + Toaster를 포함합니다.
 */

"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
