import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Achievements from "@/components/sections/Achievements";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "NASA Space Apps Global Finalist, Galactic Problem Solver, Green Earth Quest 3rd Runner-Up, and Physics Olympiad recognition.",
};

export default function AchievementsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Achievements"
        title="Awards & Achievements"
        lead="Competition results and recognition, listed exactly as awarded."
      />
      <Achievements />
    </div>
  );
}
