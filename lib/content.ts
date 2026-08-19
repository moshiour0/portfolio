/**
 * Content model for the portfolio of Moshiour Rahman (Shakib) Sarker.
 *
 * Everything here is transcribed from the authoritative specification. Two of
 * its rules shape this file:
 *
 *  - Nothing is invented. No employers, awards, publications, metrics or
 *    proficiency levels appear unless the spec states them.
 *  - Wording is precise: Explored / Built / Designed / Currently Exploring,
 *    and an architecture study is never labelled a production system.
 */

export const profile = {
  name: "Moshiour Rahman Sarker",
  displayName: "Moshiour Rahman (Shakib) Sarker",
  shortName: "Moshiour",
  role: "Aspiring Data Scientist | AI & Earth Observation | Data Analytics | Software Engineering",
  roleShort: "Data Science • AI • Earth Observation • Software Engineering",
  brand: "Technology for Understanding the World.",
  identity:
    "I build data-driven and intelligent systems at the intersection of AI, Earth observation, software engineering, and scientific problem solving.",
  headline: "Building with Data, AI & Technology to Solve Real-World Problems.",
  heroDescription:
    "I'm Moshiour Rahman (Shakib) Sarker, an aspiring Data Scientist from Bangladesh with a growing focus on Data Science, Artificial Intelligence, Earth Observation, and software engineering. I enjoy turning complex problems into data-driven ideas, scientific explorations, and practical systems.",
  supportingLine: "Always learning. Always building. Always growing.",
  tagline: "Always Learning. Always Building. Always Growing.",
  email: "moshiour.sarker792@gmail.com",
  location: "Mymensingh, Bangladesh",
  shortBio:
    "Moshiour Rahman (Shakib) Sarker is an aspiring Data Scientist exploring Artificial Intelligence, Data Analytics, Earth Observation, geospatial intelligence, and software engineering. His work ranges from interactive scientific visualization and satellite-based deformation analysis to distributed-system architecture and AI-driven disaster intelligence.",
  veryShortBio:
    "Aspiring Data Scientist exploring AI, Earth Observation, Data Analytics, and Software Engineering.",
  metaDescription:
    "Moshiour Rahman (Shakib) Sarker is an aspiring Data Scientist exploring AI, Data Analytics, Earth Observation, geospatial intelligence, scientific computing, and software engineering.",
  coreMessage:
    "Moshiour Rahman (Shakib) Sarker is an aspiring Data Scientist who combines programming, data, AI, Earth observation, and scientific curiosity to explore and build solutions for real-world problems.",
} as const;

/**
 * Verified links only, per the spec. GitHub and LinkedIn URLs were not supplied
 * in the source document, so they are intentionally absent rather than guessed.
 */
export type SocialLink = { label: string; href: string; handle: string; icon: "linkedin" | "x" | "github" | "mail" };

/** Verified links only, as the spec requires. */
export const links: SocialLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/moshiour-rahman-sarker",
    handle: "moshiour-rahman-sarker",
    icon: "linkedin",
  },
  { label: "GitHub", href: "https://github.com/moshiour0", handle: "moshiour0", icon: "github" },
  { label: "X", href: "https://x.com/moshiouro", handle: "@moshiouro", icon: "x" },
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    handle: profile.email,
    icon: "mail",
  },
];

/** Trust strip under the hero — real results, no manufactured statistics. */
export const achievementSignals = [
  { org: "NASA Space Apps", result: "Global Finalist", note: "2025" },
  { org: "Global Result", result: "Top 11", note: "" },
  { org: "Recognition", result: "Galactic Problem Solver", note: "" },
  { org: "National Competition", result: "3rd Runner-Up", note: "Green Earth Quest" },
];

export const intro = {
  heading: "Turning Data Into Stories, Ideas Into Action, and Curiosity Into Creation.",
  body: [
    "My journey started with a deep desire to solve real-world problems through technology. Over time, that curiosity evolved into building software, exploring data, participating in competitions, and working with satellite Earth-observation data.",
    "Today, I'm particularly interested in Data Science, Artificial Intelligence, geospatial intelligence, and scientific computing. With a strong foundation in Python, SQL, and data visualization, I enjoy transforming raw numbers into meaningful stories.",
    "I thrive in environments that blend logic with creativity—whether that means analyzing trends, building interactive visualizations, experimenting with satellite data, studying complex systems, or designing software architectures.",
  ],
  closing: "Always learning. Always building. Always growing.",
};

/** The five pillars of professional identity. */
export type Pillar = { index: string; title: string; statement: string; focus: string[] };

export const pillars: Pillar[] = [
  {
    index: "01",
    title: "Data Science & AI",
    statement:
      "I'm developing my foundation in Data Science, Machine Learning, Statistics, and Artificial Intelligence, with a focus on turning data into useful insights and intelligent systems.",
    focus: [
      "Data Analytics",
      "Data Science",
      "Machine Learning",
      "Artificial Intelligence",
      "Statistics",
      "Data Visualization",
      "Python",
      "SQL",
      "Scientific Computing",
    ],
  },
  {
    index: "02",
    title: "Earth Observation & Geointelligence",
    statement:
      "I'm exploring how satellite observations and geospatial technologies can help us understand changes on Earth and support disaster monitoring and environmental intelligence.",
    focus: [
      "Remote Sensing",
      "Sentinel-1",
      "SAR",
      "InSAR",
      "Google Earth Engine",
      "QGIS",
      "ESA SNAP",
      "Copernicus DEM",
      "GeoTIFF",
      "Geospatial Analysis",
    ],
  },
  {
    index: "03",
    title: "Software Engineering",
    statement:
      "I build web applications and explore backend and distributed-system architectures, from APIs and databases to event-driven microservices and cloud-native infrastructure.",
    focus: [
      "Python",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Flask",
      "FastAPI",
      "REST APIs",
      "PostgreSQL",
      "Redis",
      "Kafka",
      "Microservices",
    ],
  },
  {
    index: "04",
    title: "Systems, Cloud & Security",
    statement:
      "I'm interested in how reliable software systems are designed, secured, observed, and scaled.",
    focus: [
      "Docker",
      "Kubernetes",
      "Istio",
      "Google Cloud Platform",
      "CI/CD",
      "GitHub Actions",
      "API security",
      "JWT",
      "Rate limiting",
      "WAF",
      "mTLS",
      "Secrets management",
      "Observability",
      "Distributed systems",
      "Cybersecurity fundamentals",
    ],
  },
  {
    index: "05",
    title: "Scientific & Technical Exploration",
    statement:
      "I enjoy applying programming, mathematics, data, and systems thinking to scientific and technical problems.",
    focus: [
      "Astronomy",
      "Earth Science",
      "Remote Sensing",
      "Circuit Analysis",
      "Node Analysis",
      "Scientific Visualization",
      "Mathematical reasoning",
      "Environmental intelligence",
      "Technology ethics",
      "Philosophy",
    ],
  },
];

export type Project = {
  slug: string;
  number: string;
  name: string;
  kicker: string;
  category: string;
  tagline?: string;
  summary: string;
  /** Honest label: Project / Research Exploration / Architecture Study / Competition Project. */
  label: string;
  /** At most five, per the card design rule. */
  tags: string[];
  detail: {
    problem?: string[];
    context?: string[];
    whyItMatters?: string[];
    approach?: string[];
    flow?: { title: string; steps: string[] }[];
    phases?: { title: string; body: string; items?: string[] }[];
    data?: { label: string; items: string[] }[];
    technology: string[];
    concepts?: string[];
    services?: string[];
    infrastructure?: string[];
    achievement?: { label: string; value: string }[];
    focus?: string[];
  };
};

export const projects: Project[] = [
  {
    slug: "sarguardian",
    number: "01",
    name: "SARGuardian",
    kicker: "AI-Powered Multi-Hazard Earth Intelligence",
    category: "AI / Earth Observation / Disaster Intelligence",
    tagline: "From Space, Before Disaster Strikes.",
    label: "Concept",
    summary:
      "SARGuardian is an AI-powered Earth intelligence concept designed to combine satellite observations, geospatial data, and machine learning to detect, assess, and predict multi-hazard risks before disasters escalate.",
    tags: ["Artificial Intelligence", "Machine Learning", "Earth Observation", "Remote Sensing"],
    detail: {
      problem: [
        "Disaster detection",
        "Early risk assessment",
        "Remote monitoring",
        "Multi-hazard intelligence",
        "Situational awareness",
        "Risk prediction",
      ],
      flow: [
        {
          title: "Core idea",
          steps: [
            "Satellite Data",
            "Earth Observation",
            "AI / ML Analysis",
            "Hazard Detection",
            "Risk Assessment",
            "Prediction",
            "Early Intelligence",
            "Decision Support",
          ],
        },
      ],
      technology: [
        "Artificial Intelligence",
        "Machine Learning",
        "Satellite Imagery",
        "Earth Observation",
        "Remote Sensing",
        "Geospatial Analysis",
        "Data Science",
      ],
    },
  },
  {
    slug: "insar",
    number: "02",
    name: "InSAR Landslide / Glacier Collapse Detection",
    kicker: "Satellite-Based Ground Deformation Monitoring",
    category: "Satellite + Research + Geospatial Intelligence",
    label: "Research Exploration",
    summary:
      "A research-oriented, multi-phase project exploring how Synthetic Aperture Radar interferometry can detect subtle ground-surface deformation associated with landslide and glacier-collapse risk.",
    tags: ["Sentinel-1", "SAR", "InSAR", "ESA SNAP", "Python"],
    detail: {
      context: ["Study context: Blatten, Switzerland"],
      approach: [
        "Explore whether satellite radar observations can reveal subtle surface deformation before, during, or after major slope/glacier events.",
      ],
      phases: [
        {
          title: "Phase 01 — Data Collection",
          body: "Collect and organize appropriate environmental and satellite datasets.",
          items: [
            "Sentinel-1",
            "Swiss environmental/geospatial data",
            "Copernicus datasets",
            "Digital Elevation Models",
            "Geographic boundary/AOI data",
          ],
        },
        {
          title: "Phase 02 — Toolchain & Environment",
          body: "Prepare the processing environment and tools.",
          items: [
            "Python",
            "ASF Search",
            "ESA SNAP",
            "SNAPHU",
            "ISCE2",
            "MintPy",
            "QGIS",
            "Copernicus DEM",
            "Conda / Miniconda",
          ],
        },
        {
          title: "Phase 03 — Radar Analysis",
          body: "Perform the interferometric processing workflow.",
        },
        {
          title: "Phase 04 — Intelligence",
          body: "Transform processed deformation information into interpretable insights.",
          items: [
            "deformation maps",
            "displacement patterns",
            "temporal comparisons",
            "geospatial visualization",
            "risk indicators",
            "disaster-monitoring intelligence",
          ],
        },
      ],
      flow: [
        {
          title: "Interferometric workflow",
          steps: [
            "Sentinel-1 SLC",
            "Track / Acquisition Selection",
            "Orbit File",
            "TOPSAR Split",
            "Coregistration",
            "Back-Geocoding",
            "Interferogram Formation",
            "TOPSAR Deburst",
            "Topographic Phase Removal",
            "Goldstein Filtering",
            "SNAPHU Unwrapping",
            "Phase → Displacement",
            "Terrain Correction",
            "GeoTIFF",
          ],
        },
      ],
      data: [
        { label: "Primary", items: ["Sentinel-1 SLC"] },
        { label: "Supporting", items: ["Copernicus DEM"] },
        {
          label: "Potential supporting datasets",
          items: ["Swiss environmental data", "AOI boundaries", "terrain information"],
        },
      ],
      technology: [
        "Python",
        "ASF Search",
        "Sentinel-1",
        "SAR",
        "InSAR",
        "ESA SNAP",
        "SNAPHU",
        "ISCE2",
        "MintPy",
        "Copernicus DEM",
        "QGIS",
        "GeoTIFF",
        "Google Earth Engine where applicable",
      ],
      whyItMatters: [
        "Satellite radar can provide a powerful way to observe surface deformation across difficult and remote terrain. This project explores how that information can contribute to earlier understanding of landslide and glacier-related hazards.",
      ],
    },
  },
  {
    slug: "orrery",
    number: "03",
    name: "NASA Space Apps Orrery",
    kicker: "Interactive Solar System / Orrery",
    category: "Astronomy + Visualization + Achievement",
    tagline: "Exploring the Solar System Through Code, Data & Visualization.",
    label: "Competition Project",
    summary:
      "An interactive web-based solar-system visualization designed to make astronomical structures and planetary motion more engaging through interactive scientific visualization.",
    tags: ["JavaScript", "D3.js", "NASA APIs", "Data Visualization"],
    detail: {
      technology: ["JavaScript", "D3.js", "HTML", "CSS", "NASA APIs", "Data Visualization"],
      concepts: [
        "Astronomy",
        "Scientific visualization",
        "Interactive web development",
        "Real-world data",
        "Educational technology",
      ],
      achievement: [
        { label: "Competition", value: "NASA Space Apps Challenge" },
        { label: "Achievement", value: "NASA Space Apps Global Finalist — 2025" },
        { label: "Recognition", value: "Galactic Problem Solver" },
        { label: "Global result", value: "Top 11" },
        { label: "Location", value: "Zurich, Switzerland" },
        { label: "Date", value: "October 2025" },
      ],
    },
  },
  {
    slug: "commerce-microservices",
    number: "04",
    name: "Commerce Microservices Architecture",
    kicker: "Production-Oriented Commerce Microservices Architecture",
    category: "Distributed Systems + Cloud + Software Engineering",
    // The spec is explicit: this is not a running production system.
    label: "Architecture / System Design Project",
    summary:
      "A production-oriented commerce architecture designed around scalability, resilience, event-driven communication, service isolation, observability, security, and fault tolerance.",
    tags: ["Kubernetes", "Apache Kafka", "Istio", "PostgreSQL", "Event-Driven"],
    detail: {
      flow: [
        {
          title: "Architecture",
          steps: [
            "Users",
            "CDN / WAF",
            "Ingress Gateway",
            "Shop / Checkout BFF",
            "Microservices",
            "Event Mesh",
            "Service Databases",
          ],
        },
      ],
      services: [
        "User",
        "Catalog",
        "Cart",
        "Pricing",
        "Promotion",
        "Tax",
        "Shipping",
        "Order",
        "Inventory",
        "Fraud",
        "Payment",
        "Notification",
        "Shipment",
      ],
      infrastructure: [
        "Docker",
        "Kubernetes",
        "Istio",
        "Apache Kafka",
        "Redis",
        "PostgreSQL",
        "Elasticsearch",
        "Debezium",
        "MinIO",
        "HashiCorp Vault",
        "OpenTelemetry",
        "Prometheus",
        "Grafana",
        "GitHub Actions",
      ],
      concepts: [
        "Event-driven architecture",
        "Saga pattern",
        "CDC",
        "Database-per-service",
        "Distributed transactions",
        "Horizontal autoscaling",
        "mTLS",
        "Service authorization",
        "Distributed tracing",
        "Dead Letter Queues",
        "Secrets management",
        "Caching",
        "Search infrastructure",
        "Payment integration",
        "Notification architecture",
      ],
      technology: ["Docker", "Kubernetes", "Istio", "Apache Kafka", "PostgreSQL", "Redis"],
    },
  },
  {
    slug: "portfolio",
    number: "05",
    name: "Personal Portfolio",
    kicker: "Personal Digital Laboratory",
    category: "Frontend + UX + Engineering",
    label: "Project",
    summary:
      "My portfolio is not only a personal website—it is an evolving digital laboratory where I document what I build, research, learn, and explore.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    detail: {
      technology: [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Framer Motion",
        "Git",
        "GitHub",
        "Vercel",
      ],
      focus: [
        "responsive design",
        "interactive UI",
        "animation",
        "project storytelling",
        "SEO",
        "accessibility",
        "performance",
        "technical documentation",
      ],
    },
  },
];

export const research = {
  heading: "Research & Exploration",
  intro:
    "I'm interested in applying computation, data, and AI to scientific and environmental problems.",
  areas: [
    {
      title: "Earth Observation",
      items: [
        "satellite imagery",
        "SAR",
        "InSAR",
        "remote sensing",
        "geospatial intelligence",
        "environmental monitoring",
        "disaster detection",
      ],
    },
    {
      title: "AI for Earth Observation",
      items: [
        "machine learning",
        "automated satellite-image analysis",
        "hazard detection",
        "predictive intelligence",
        "geospatial AI",
      ],
    },
    {
      title: "Scientific Computing",
      items: [
        "astronomy",
        "Earth science",
        "environmental analysis",
        "scientific visualization",
        "mathematical modeling",
      ],
    },
  ],
};

/** Grouped by domain. The spec forbids subjective percentage bars. */
export const skillGroups = [
  { title: "Programming", items: ["Python", "SQL", "C", "JavaScript", "TypeScript", "HTML", "CSS"] },
  {
    title: "Data & AI",
    items: [
      "Data Analytics",
      "Data Science",
      "Data Visualization",
      "Machine Learning",
      "Artificial Intelligence",
      "Statistics",
      "Scientific Computing",
    ],
  },
  {
    title: "Geospatial & Earth Observation",
    items: [
      "Sentinel-1",
      "SAR",
      "InSAR",
      "Google Earth Engine",
      "Remote Sensing",
      "QGIS",
      "ESA SNAP",
      "Copernicus DEM",
      "GeoTIFF",
      "Geospatial Analysis",
    ],
  },
  {
    title: "Web Development",
    items: [
      "React",
      "Next.js",
      "JavaScript",
      "TypeScript",
      "D3.js",
      "Flask",
      "FastAPI",
      "REST APIs",
    ],
  },
  {
    title: "Databases & Data Infrastructure",
    items: [
      "PostgreSQL",
      "Redis",
      "Elasticsearch",
      "MinIO",
      "Debezium",
      "Kafka",
      "Schema Registry",
    ],
  },
  {
    title: "Distributed Systems",
    items: [
      "Microservices",
      "Event-Driven Architecture",
      "Saga Pattern",
      "CDC",
      "Service-to-Service Communication",
      "WebSockets",
      "Socket.IO",
      "Caching",
      "Message Queues",
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      "Google Cloud Platform (GCP)",
      "Docker",
      "Docker Compose",
      "Kubernetes",
      "Istio",
      "GitHub Actions",
      "CI/CD",
    ],
  },
  {
    title: "Security",
    items: [
      "Cybersecurity Fundamentals",
      "JWT",
      "API Security",
      "Rate Limiting",
      "WAF",
      "DDoS Protection Concepts",
      "mTLS",
      "Service Authorization",
      "Secrets Management",
      "HashiCorp Vault",
    ],
  },
  {
    title: "Observability",
    items: [
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
      "ELK",
      "Datadog",
      "Logging",
      "Metrics",
      "Distributed Tracing",
    ],
  },
  {
    // Presented as a technical/academic foundation, never as professional EE work.
    title: "Systems / Electrical Foundations",
    items: [
      "Circuit Analysis",
      "Node Analysis",
      "Electrical Problem Solving",
      "Mathematical Analysis",
    ],
  },
  {
    title: "Tools & Environments",
    items: [
      "Git",
      "GitHub",
      "Windows Environment Configuration",
      "PowerShell",
      "CLI Automation",
      "VS Code",
      "PyCharm",
      "Termux",
      "Miniconda",
      "Conda",
      "Mamba",
      "Winget Package Management",
    ],
  },
];

/** Journey, not employment — the spec forbids fabricating jobs. */
export type JourneyEntry = { period: string; title: string; body?: string; items?: string[] };

export const journey: JourneyEntry[] = [
  {
    period: "2021–2022",
    title: "Robotics & Embedded Systems Training",
    body: "Early technical exposure to:",
    items: ["robotics", "embedded systems", "electronics", "technical problem solving"],
  },
  {
    period: "2024",
    title: "Competitions & Scientific Exploration",
    items: [
      "Green Earth Quest",
      "NASA Space Apps",
      "Physics Olympiad",
      "scientific/technical experimentation",
    ],
  },
  {
    period: "2025",
    title: "NASA Space Apps Challenge",
    body: "Built an Interactive Solar System / Orrery.",
    items: [
      "Achievement: Global Finalist",
      "Recognition: Galactic Problem Solver",
      "Result: Top 11",
      "Location: Zurich, Switzerland",
    ],
  },
  {
    period: "2025–2026",
    title: "Satellite & InSAR Exploration",
    body: "Explored:",
    items: [
      "Sentinel-1",
      "SAR",
      "InSAR",
      "satellite deformation analysis",
      "landslide detection",
      "glacier-collapse monitoring",
      "Copernicus DEM",
      "SNAP",
      "SNAPHU",
      "MintPy",
      "ISCE2",
    ],
  },
  {
    period: "2026",
    title: "AI, Data & Software Systems",
    body: "Current work and exploration includes:",
    items: [
      "SARGuardian",
      "Data Science",
      "Artificial Intelligence",
      "Google Earth Engine",
      "geospatial intelligence",
      "distributed systems",
      "microservices",
      "cloud architecture",
      "cybersecurity-conscious system design",
    ],
  },
];

export const education = [
  {
    institution: "Agricultural University College",
    qualification: "Higher Secondary Certificate (HSC), Science",
    period: "Feb 2023 – Aug 2024",
    grade: "A+",
    gpa: "5.00 / 5.00",
    location: "Mymensingh, Bangladesh",
  },
  {
    institution: "Phulpur Pilot Model Government High School",
    qualification: "Secondary School Certificate (SSC), Science",
    period: "Sep 2018 – Oct 2022",
    grade: "A+",
    gpa: "5.00 / 5.00",
    location: "",
  },
];

export const academicDirection = {
  heading: "Future Focus",
  direction: "Data Science / Artificial Intelligence / Applied Statistics & Data Science",
  interests: [
    "Machine Learning",
    "AI",
    "Statistics",
    "Data Analytics",
    "Scientific Computing",
    "Geospatial Data",
    "Earth Observation",
  ],
  postgraduate: "MSc in Data Science / AI / Applied Statistics & Data Science",
};

export const awards = [
  {
    title: "NASA Space Apps Challenge",
    result: "Global Finalist — 2025",
    notes: ["Top 11", "Galactic Problem Solver", "Zurich, Switzerland"],
  },
  {
    title: "Green Earth Quest",
    result: "3rd Runner-Up — National Competition",
    notes: ["May 2024"],
  },
  {
    // The spec says the exact medal/year is shown only once verified.
    title: "Physics Olympiad",
    result: "Regional Medalist",
    notes: [],
  },
];

export const values = [
  {
    title: "Curiosity & Purpose",
    body: "I am driven by curiosity, purpose, and a deep desire to solve real-world problems through technology.",
  },
  {
    title: "Logic & Creativity",
    body: "I thrive in environments that blend logic with creativity, turning data into stories and ideas into action.",
  },
  {
    title: "Problem Solving",
    body: "I enjoy turning complex problems into manageable systems—from distributed microservices to step-by-step circuit analysis.",
  },
  {
    title: "Science & Technology",
    body: "I'm interested in applying technology to scientific and real-world challenges.",
  },
  {
    title: "Collaboration & Empathy",
    body: "I believe the best solutions come from collaboration, empathy, and a bold willingness to explore new ideas.",
  },
  {
    title: "Ethics & Philosophy",
    body: "Beyond technology itself, I spend time thinking about human morality, philosophical questions, and the broader consequences of the systems we create. I believe understanding the “why” behind what we do is just as important as understanding the “how.”",
  },
  {
    title: "Continuous Growth",
    body: "Every project is another opportunity to learn something new.",
  },
  { title: "Building", body: "I prefer learning by actually creating things." },
];

export const about = {
  heading: "Turning Curiosity Into Creation.",
  body: [
    "I'm Moshiour Rahman Sarker, a motivated and detail-oriented individual with a passion for uncovering insights through data.",
    "I enjoy exploring the intersection between software, data, science, and real-world problems. I thrive in environments that blend logic with creativity. My projects have taken me from interactive astronomy applications—using real NASA datasets to merge science, coding, and design—to satellite-based deformation analysis and large-scale distributed-system architecture.",
    "I'm particularly interested in Data Science, Artificial Intelligence, geospatial intelligence, and scientific computing. With a foundation in Python, SQL, data visualization, and programming, I enjoy transforming raw information into meaningful insights and building systems around complex problems.",
    "Beyond just the code, I spend time thinking about the philosophical implications of our actions and how human morality intersects with the systems we build. I believe that understanding the “why” behind what we do is just as important as understanding the “how.”",
    "What drives me? Curiosity. Purpose. Problem solving.",
    "I believe the best solutions come from collaboration, empathy, and a bold willingness to explore new ideas.",
    "I'm currently building my foundations toward a future in Data Science and AI while continuing to explore scientific computing, geospatial intelligence, software engineering, cloud technologies, and cybersecurity-conscious system design.",
  ],
  closing: "Always learning. Always building. Always growing.",
};

export const philosophy = {
  heading: "Beyond the Code",
  statement:
    "Technology explains how we build things. Philosophy asks why we should build them, what they mean, and what consequences they may have.",
  topics: [
    "human morality",
    "ethics",
    "technology and society",
    "scientific thinking",
    "rationality",
    "human decision making",
    "responsibility",
    "meaning",
    "knowledge",
    "technology's consequences",
  ],
  writingHeading: "Ideas Beyond the Code",
  writingIntro:
    "I also enjoy writing and thinking about questions that sit outside pure technology—especially philosophy, morality, science, reasoning, and the relationship between humans and the systems we create.",
};

export const learningPhilosophy = {
  heading: "I Learn by Building.",
  body: [
    "I believe the fastest way to understand technology is to build something with it.",
    "Instead of learning tools in isolation, I try to connect them to real problems—whether that means visualizing astronomical data, analyzing satellite imagery, studying circuits, designing distributed systems, or exploring AI-driven disaster intelligence.",
    "Every project is an opportunity to understand something more deeply.",
  ],
};

export const currentlyExploring = [
  {
    title: "Data Science",
    items: [
      "Statistics",
      "Python",
      "SQL",
      "Data analysis",
      "Machine learning",
      "Data visualization",
    ],
  },
  {
    title: "Artificial Intelligence",
    items: [
      "Machine learning",
      "AI systems",
      "AI for Earth observation",
      "intelligent disaster monitoring",
    ],
  },
  {
    title: "Earth Observation",
    items: [
      "Sentinel-1",
      "SAR",
      "InSAR",
      "Google Earth Engine",
      "geospatial analysis",
      "deformation monitoring",
    ],
  },
  {
    title: "Software Engineering",
    items: [
      "backend systems",
      "microservices",
      "event-driven architecture",
      "distributed systems",
      "Kubernetes",
    ],
  },
  {
    title: "Cloud",
    items: ["GCP", "containerization", "deployment", "scalable infrastructure"],
  },
  {
    title: "Security",
    items: [
      "application security",
      "secure APIs",
      "authentication",
      "authorization",
      "infrastructure security",
    ],
  },
];

export const contact = {
  heading: "Let's Build Something Meaningful.",
  description:
    "Have an interesting project, research idea, technical problem, or opportunity to collaborate? I'd love to hear from you.",
};

/** Homepage sections, in the order the spec prescribes. */
export const sections = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];
