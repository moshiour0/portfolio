import HashScroll from "@/components/HashScroll";
import Hero from "@/components/sections/Hero";
import { AchievementStrip, Intro } from "@/components/sections/Intro";
import Pillars from "@/components/sections/Pillars";
import Projects from "@/components/sections/Projects";
import Research from "@/components/sections/Research";
import Skills from "@/components/sections/Skills";
import { Education, Journey } from "@/components/sections/Journey";
import Achievements from "@/components/sections/Achievements";
import About from "@/components/sections/About";
import Exploring from "@/components/sections/Exploring";
import Contact from "@/components/sections/Contact";

/** Homepage order is prescribed by the specification. */
export default function Home() {
  return (
    <>
      <HashScroll />
      <Hero />
      <AchievementStrip />
      <Intro />
      <Pillars />
      <Projects />
      <Research />
      <Skills />
      <Journey />
      <Education />
      <Achievements />
      <About />
      <Exploring />
      <Contact />
    </>
  );
}
