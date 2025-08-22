"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

export function BookTabs({
  overview,
  insights,
  chapters,
  recommendations,
  evidence,
  about,
}: {
  overview?: ReactNode;
  insights?: ReactNode;
  chapters?: ReactNode;
  recommendations?: ReactNode;
  evidence?: ReactNode;
  about?: ReactNode;
}) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="sticky top-0 z-10 bg-background">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
        <TabsTrigger value="chapters">Chapters</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        {evidence && <TabsTrigger value="evidence">Evidence</TabsTrigger>}
        {about && <TabsTrigger value="about">About</TabsTrigger>}
      </TabsList>
      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="insights">{insights}</TabsContent>
      <TabsContent value="chapters">{chapters}</TabsContent>
      <TabsContent value="recommendations">{recommendations}</TabsContent>
      {evidence && <TabsContent value="evidence">{evidence}</TabsContent>}
      {about && <TabsContent value="about">{about}</TabsContent>}
    </Tabs>
  );
}