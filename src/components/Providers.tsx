"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 min — don't refetch focus areas unnecessarily
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        theme="dark"
        expand={false}
        toastOptions={{
          style: {
            background: "#0B0F19",
            border: "1px solid #1F2933",
            color: "#fff",
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            width: "100%",
            maxWidth: "420px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
