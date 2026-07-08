import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ProjectsClient } from "@/features/projects/projects-client";

export default function ProjectsPage() {
  return (
    <AppLayout title="Projects">
      <ProjectsClient />
    </AppLayout>
  );
}
