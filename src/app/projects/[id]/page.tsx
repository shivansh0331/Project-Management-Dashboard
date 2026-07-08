import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ProjectDetailsClient } from "@/features/projects/project-details-client";

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  return (
    <AppLayout title={`Project Details`}>
      <ProjectDetailsClient id={projectId} />
    </AppLayout>
  );
}
