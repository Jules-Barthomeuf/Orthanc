"use client";

import { ToastContainer } from "@/components/common/ToastContainer";

export function RootWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
