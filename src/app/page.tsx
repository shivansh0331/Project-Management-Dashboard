import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardClient } from "@/features/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard">
      <DashboardClient />
    </AppLayout>
  );
}
