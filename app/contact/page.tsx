import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Contact from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Have an interesting project, research idea, technical problem, or opportunity to collaborate?",
};

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Contact"
        title="Let's Build Something Meaningful."
        lead="Have an interesting project, research idea, technical problem, or opportunity to collaborate?"
      />
      <Contact />
    </div>
  );
}
