"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AgentDashboard } from "@/components/agent/AgentDashboard";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AgentDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    document.title = 'Orthanc - Dashboard';
    if (!user || user.role !== "agent") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || user.role !== "agent") {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <AgentDashboard />
      </div>
    </div>
  );
}
