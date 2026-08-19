import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import About from "@/components/sections/About";
import { Education, Journey } from "@/components/sections/Journey";

export const metadata: Metadata = {
  title: "About",
  description:
    "Moshiour Rahman (Shakib) Sarker — aspiring Data Scientist exploring AI, Earth observation, data analytics and software engineering.",
};

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="About"
        title="Turning Curiosity Into Creation."
        lead="An aspiring Data Scientist exploring AI, Earth observation, data analytics and software engineering."
      />
      <About />
      <Journey />
      <Education />
    </div>
  );
}
