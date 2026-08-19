import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Research from "@/components/sections/Research";

export const metadata: Metadata = {
  title: "Research & Exploration",
  description:
    "Applying computation, data and AI to scientific and environmental problems — Earth observation, AI for Earth observation, and scientific computing.",
};

export default function ResearchPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Research"
        title="Research & Exploration"
        lead="I'm interested in applying computation, data, and AI to scientific and environmental problems."
      />
      <Research />
    </div>
  );
}
