/**
 * Single source of truth for all portfolio content.
 * Every fact here is taken from the supplied resume, IEEE paper, certificate,
 * or the portfolio brief. Do not add metrics, links, or screenshots that were
 * not supplied.
 */

export const profile = {
  name: "PASUNUTI VIVEK",
  firstName: "PASUNUTI",
  lastName: "VIVEK",
  role: "AI ENGINEER",
  organization: "SIGMANIX TECH SOLUTIONS",
  location: "Hyderabad, India",
  email: "pasunuti112004@gmail.com",
  phone: "+91 9515541357",
  phoneHref: "tel:+919515541357",
  github: "https://github.com/vivvek69",
  githubHandle: "vivvek69",
  linkedin: "https://www.linkedin.com/in/pasunuti-vivek-33b58a2b3/",
  linkedinHandle: "pasunuti-vivek-33b58a2b3",
  photo: "/assets/profile/vivek-photo.jpg",
  resume: "/assets/documents/resume.pdf",
  specializations: [
    "Agentic AI",
    "Generative AI",
    "LLM Applications",
    "Backend Engineering",
    "AI/ML Integration",
  ],
  introduction:
    "I am an AI Engineer focused on building intelligent applications, agentic workflows, LLM-powered systems, and backend services. I work across AI integration, backend development, API orchestration, and database-driven applications to turn practical problems into working software solutions.",
};

export type Ability = { id: string; name: string; kanji: string; detail: string };

/** Character abilities (Screen 02). `kanji` is a decorative numeral only. */
export const abilities: Ability[] = [
  { id: "lang", name: "Python and Java", kanji: "壱", detail: "Primary languages for AI services, backend APIs, and enterprise systems." },
  { id: "agentic", name: "Agentic AI", kanji: "弐", detail: "Agents that understand requests, plan tasks, and act through backend tools." },
  { id: "genai", name: "Generative AI and LLMs", kanji: "参", detail: "LLM applications, prompt engineering, Groq LLM, and context management." },
  { id: "rag", name: "RAG and Multi-Agent Systems", kanji: "肆", detail: "Grounded retrieval pipelines and coordinated multi-agent workflows." },
  { id: "backend", name: "Backend Engineering", kanji: "伍", detail: "FastAPI and Flask services, REST APIs, auth, and database integration." },
  { id: "ml", name: "Machine Learning", kanji: "陸", detail: "CNNs, computer vision, TensorFlow, PyTorch, and reinforcement-learning concepts." },
];

export const experience = {
  role: "AI Engineer",
  company: "Sigmanix Tech Solutions",
  type: "Full-Time",
  period: "April 2026 – Present",
  start: "APR 2026",
  stack: ["Python", "FastAPI", "LangChain", "LangGraph", "Groq", "RAG", "Supabase", "PostgreSQL"],
  responsibilities: [
    {
      title: "Agentic Applications",
      text: "Develop AI applications and agentic workflows using Python, LLMs, FastAPI, LangChain, and LangGraph.",
    },
    {
      title: "Tool-Using Agents",
      text: "Build agents that understand user requests, execute tasks, interact with backend tools, and provide context-aware responses.",
    },
    {
      title: "Orchestration APIs",
      text: "Develop multi-step agent workflows and REST APIs for orchestration, structured data collection, validation, and backend integration.",
    },
    {
      title: "RAG Systems",
      text: "Implement RAG systems involving document ingestion, chunking, embeddings, semantic search, and grounded LLM responses.",
    },
    {
      title: "Support Workflows",
      text: "Develop customer-support workflows for booking, validation, escalation, and immediate assistance using Groq, FastAPI, Supabase, and PostgreSQL.",
    },
    {
      title: "LMS Platform",
      text: "Work on LMS authentication, role-based access, user, course, batch, assignment, and content management.",
    },
    {
      title: "Enterprise Products",
      text: "Contribute to Loan Management System and SIGMANIX SPACES.",
    },
    {
      title: "Reliability",
      text: "Integrate databases and APIs, test workflows, debug backend issues, and improve application reliability.",
    },
  ],
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  kanji: string;
  overview: string;
  contributions: string[];
  features: string[];
  tech: string[];
  /** Real links only. `null` means none was supplied. */
  github: string | null;
  live: string | null;
  screenshots: { src: string; alt: string; caption: string }[];
  research?: boolean;
};

export const projects: Project[] = [
  {
    slug: "sigmanix-spaces",
    index: "01",
    title: "SIGMANIX SPACES",
    category: "Property and Space Management Platform",
    kanji: "空",
    overview:
      "A property and space management platform covering Property, CRM, and Accounts modules for managing multiple properties, buildings, floors, spaces, tenants, and day-to-day property operations.",
    contributions: [
      "Contributed to the Property, CRM, and Accounts modules.",
      "Developed frontend modules and integrated FastAPI REST APIs for property inventory, space hierarchy, layouts, bookings, tenant workflows, and property-level filters.",
      "Worked with hierarchical inventory structures, including building/floor/parent-space relationships, space depth, area, and rentable-space attributes.",
      "Used PostgreSQL and Supabase for relational data management, validation, and allocation workflows supporting availability checks and booking/lease conflict prevention.",
      "Supported layout and allocation requirements, including active layout versions, confirmed booking states, and date-based lease periods.",
    ],
    features: [
      "Property management",
      "Multiple buildings and locations",
      "Building / floor / space hierarchy",
      "Space inventory",
      "Layout management",
      "Bookings and leases",
      "Tenant management",
      "Property availability",
      "Search and filtering",
      "Allocation conflict prevention",
      "Property administration",
    ],
    tech: ["React", "TypeScript", "FastAPI", "Python", "PostgreSQL", "Supabase"],
    github: null,
    live: null,
    screenshots: [],
  },
  {
    slug: "loan-management-system",
    index: "02",
    title: "LOAN MANAGEMENT SYSTEM",
    category: "Role-Based Lending Platform — Backend Development",
    kanji: "貸",
    overview:
      "A role-based loan-management system supporting Admin, Agent, and Customer workflows, including location-based loan discovery for agents.",
    contributions: [
      "Developed the backend supporting Admin, Agent, and Customer workflows using Java and Spring Boot.",
      "Designed REST APIs and PostgreSQL data models for loan records, application workflows, and role-specific operations.",
      "Implemented customer OTP authentication, agent email/password signup and login, and administrative authentication workflows.",
      "Developed backend support for location-based loan discovery, enabling agents to retrieve nearby loan opportunities using GPS coordinates.",
    ],
    features: [
      "Admin, Agent, and Customer workflows",
      "Customer OTP login and registration",
      "Agent email/password authentication",
      "Admin authentication",
      "Location-based loan discovery",
      "Loan application management",
      "Backend API integration",
    ],
    tech: ["Flutter", "Java", "Spring Boot", "PostgreSQL", "REST APIs", "GPS/Location Services"],
    github: null,
    live: null,
    screenshots: [],
  },
  {
    slug: "empathetic-ai-companion",
    index: "03",
    title: "EMPATHETIC AI COMPANION",
    category: "Emotion-Aware Robotic System",
    kanji: "心",
    overview:
      "A multimodal robotic companion that recognises a person's emotional state from face and voice, then adapts its behaviour and dialogue. This project is the subject of an IEEE conference paper presented at ICEARS 2026.",
    contributions: [
      "Built CNN-based facial emotion recognition with OpenCV, alongside audio processing and real-time emotion analysis.",
      "Processed visual and audio inputs to identify emotional states and support adaptive response generation.",
      "Applied reinforcement-learning concepts to map detected emotional states to suitable actions.",
      "Integrated Groq LLM with speech-to-text and text-to-speech for context-aware voice interaction.",
    ],
    features: [
      "Facial Emotion Recognition",
      "Speech Emotion Recognition",
      "Multimodal emotion fusion",
      "Adaptive response generation",
      "Reinforcement Learning-based decision-making",
      "LLM dialogue",
      "Speech interaction",
      "Robotic integration",
    ],
    tech: ["Python", "OpenCV", "CNN", "Reinforcement Learning", "Groq LLM", "ROS", "Raspberry Pi 5"],
    github: null,
    live: null,
    screenshots: [
      {
        src: "/assets/research/fig4-test-neutral.webp",
        alt: "Companion test output: face detected as neutral, robot face asks how the day is going",
        caption: "Neutral — “How is your day going?”",
      },
      {
        src: "/assets/research/fig4-test-happy.webp",
        alt: "Companion test output: face detected as happy, robot face smiles",
        caption: "Happy — “Nice to see you happy! What's up?”",
      },
      {
        src: "/assets/research/fig4-test-angry.webp",
        alt: "Companion test output: face detected as angry, robot face turns red",
        caption: "Angry — “Let's try calming down a little.”",
      },
      {
        src: "/assets/research/fig4-test-surprise.webp",
        alt: "Companion test output: face detected as surprised, robot face turns green",
        caption: "Surprise — “Oh! What happened?”",
      },
    ],
    research: true,
  },
  {
    slug: "animeworld",
    index: "04",
    title: "ANIMEWORLD",
    category: "Anime Merchandise Marketplace",
    kanji: "店",
    overview:
      "A responsive anime merchandise marketplace with product discovery, category browsing, search, and authentication workflows.",
    contributions: [
      "Developed the marketplace with product discovery, category browsing, search, and authentication workflows.",
      "Integrated React, Supabase, and PostgreSQL for reusable frontend components, backend services, and database-backed application workflows.",
      "Structured application data and connected user-facing features with persistent product and account information.",
    ],
    features: [
      "Anime merchandise marketplace",
      "Product discovery and categories",
      "Search and filtering",
      "Authentication",
      "Database-backed products and accounts",
      "Responsive interface",
    ],
    tech: ["React", "Supabase", "PostgreSQL"],
    github: null,
    live: null,
    screenshots: [],
  },
  {
    slug: "smart-irrigation",
    index: "05",
    title: "SMART IRRIGATION USING AI",
    category: "ML-Driven Irrigation Prototype",
    kanji: "水",
    overview:
      "An AI-based irrigation prototype that uses environmental data and machine-learning models to predict irrigation actions.",
    contributions: [
      "Built the prototype using environmental data and machine-learning models to predict irrigation actions.",
      "Developed Flask APIs and a monitoring interface.",
      "Processed sensor-related data using NumPy and Pandas.",
    ],
    features: [
      "Environmental data processing",
      "ML-based irrigation predictions",
      "Flask API integration",
      "Monitoring interface",
      "Data-driven irrigation recommendations",
    ],
    tech: ["Python", "Flask", "TensorFlow", "NumPy", "Pandas"],
    github: null,
    live: null,
    screenshots: [],
  },
];

export const research = {
  title: "AI-Based Emotionally Intelligent Robotic Companion for Adaptive Human-Robot Interaction",
  conference: "2026 International Conference on Electronics and Renewable Systems (ICEARS 2026)",
  conferenceShort: "ICEARS 2026",
  publisher: "IEEE",
  dates: "11–13 February 2026",
  venue: "St. Mother Theresa Engineering College, Tuticorin, Tamil Nadu, India",
  pages: "67–72",
  doi: "10.1109/ICEARS67481.2026.11416600",
  doiUrl: "https://doi.org/10.1109/ICEARS67481.2026.11416600",
  paperUrl: "/assets/documents/ieee-research-paper.pdf",
  authors: [
    "Pasunuti Vivek",
    "Dr. Muntha Raju",
    "Siddoji Gari Pravalika",
    "Rampalli Nirmal Goud",
    "Bandari Kaarthesha",
  ],
  abstract:
    "A robotic companion that combines facial emotion recognition (CNN) and speech emotion recognition (BiLSTM), fuses both modalities, uses a Deep Q-Network to adapt its behaviour to the user's emotional state, and generates empathetic dialogue with an LLM — running on a Raspberry Pi 5 with ROS 2.",
  areas: [
    "Facial Emotion Recognition",
    "Speech Emotion Recognition",
    "CNN",
    "BiLSTM",
    "Multimodal Emotion Fusion",
    "Deep Q-Network",
    "LLM-based Dialogue",
    "ROS2",
    "Raspberry Pi 5",
    "Adaptive Human-Robot Interaction",
  ],
  /** Results as reported in the paper (Section IV). Not independently verified. */
  metrics: [
    { label: "Facial Emotion Recognition", value: "81.4%", context: "normal lighting" },
    { label: "Facial Emotion Recognition", value: "73.5%", context: "low light (infrared)" },
    { label: "Speech Emotion Recognition", value: "88%", context: "no background noise" },
    { label: "Speech Emotion Recognition", value: "81%", context: "moderate background noise" },
    { label: "Multimodal Fusion", value: ">82%", context: "estimated overall accuracy" },
  ],
  figures: [
    { src: "/assets/research/fig1-architecture.webp", caption: "Figure 1 — Proposed design architecture", w: 655, h: 808 },
    { src: "/assets/research/fig2-fer-training.webp", caption: "Figure 2 — FER model training accuracy over epochs", w: 630, h: 384 },
    { src: "/assets/research/fig3-ser-training.webp", caption: "Figure 3 — SER model training accuracy over epochs", w: 642, h: 584 },
  ],
};

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  thumb: string;
  pdf: string;
};

/** Only supplied certificates. */
export const certificates: Certificate[] = [
  {
    id: "icears-2026",
    title: "Certificate of Presentation — ICEARS 2026",
    issuer: "IEEE · ICEARS · St. Mother Theresa Engineering College",
    date: "11–13 February 2026",
    description:
      "Presented “AI-Based Emotionally Intelligent Robotic Companion for Adaptive Human-Robot Interaction” at the 4th International Conference on Electronics and Renewable Systems.",
    image: "/assets/certificates/ieee-conference-certificate.webp",
    thumb: "/assets/certificates/ieee-conference-certificate-thumb.webp",
    pdf: "/assets/certificates/ieee-conference-certificate.pdf",
  },
];

/** Completed learning without a supplied certificate — shown without a verified badge. */
export const coursework = [
  { title: "Generative AI and Agentic AI", note: "Course completed · certificate not yet added" },
];

export const education = [
  {
    level: "B.Tech",
    degree: "Bachelor of Technology — Computer Science and Engineering",
    field: "Computer Science and Engineering",
    institution: "Nalla Malla Reddy Engineering College",
    location: "Hyderabad",
    period: "2023–2026",
    cgpa: "8.5",
  },
  {
    level: "Diploma",
    degree: "Diploma — Electrical and Electronics Engineering",
    field: "Electrical and Electronics Engineering",
    institution: "JNG Polytechnic",
    location: "Hyderabad",
    period: "2020–2023",
    cgpa: "8.06",
  },
  {
    level: "SSC",
    degree: "Secondary School Certificate",
    field: "Secondary School",
    institution: "Sri Chaitanya E-Techno School",
    location: null as string | null,
    period: "2019–2020",
    cgpa: "10.0",
  },
];

export type SkillCategory = { id: string; name: string; kanji: string; items: string[] };

export const skillCategories: SkillCategory[] = [
  { id: "programming", name: "Programming", kanji: "符", items: ["Python", "Java", "JavaScript", "SQL", "HTML", "CSS"] },
  {
    id: "genai",
    name: "Generative AI / LLMs",
    kanji: "生",
    items: ["Generative AI", "LLMs", "LLM Applications", "Prompt Engineering", "Groq LLM", "AI Chatbots", "Context Management"],
  },
  {
    id: "agentic",
    name: "Agentic AI",
    kanji: "動",
    items: ["AI Agents", "Agentic AI", "LangChain", "LangGraph", "Multi-Agent Workflows", "Task Execution", "Workflow Orchestration", "Tool Use", "Task Planning", "Agent Automation"],
  },
  {
    id: "rag",
    name: "RAG / Retrieval",
    kanji: "索",
    items: ["RAG", "Document Processing", "Chunking", "Embeddings", "Semantic Search", "Vector Search", "FAISS", "Knowledge Retrieval", "Contextual Retrieval"],
  },
  {
    id: "aiml",
    name: "AI / ML",
    kanji: "学",
    items: ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "CNN", "OpenCV", "Computer Vision", "Reinforcement Learning Concepts"],
  },
  {
    id: "backend",
    name: "Backend",
    kanji: "基",
    items: ["FastAPI", "Flask", "REST APIs", "JSON", "API Integration", "Backend Services", "SDK Integration"],
  },
  {
    id: "databases",
    name: "Databases",
    kanji: "蔵",
    items: ["PostgreSQL", "MySQL", "SQL", "Supabase", "Database Design", "CRUD", "Database Relationships", "pgVector Basics", "Vector Database Concepts"],
  },
  {
    id: "swe",
    name: "Software Engineering",
    kanji: "工",
    items: ["OOP", "Data Structures", "SDLC", "System Integration", "Testing", "Debugging", "Error Handling", "Logging", "Clean Code Practices"],
  },
  {
    id: "cloud",
    name: "Cloud / DevOps",
    kanji: "雲",
    items: ["Docker", "AWS Fundamentals", "Azure Fundamentals", "Deployment Concepts", "CI/CD Concepts"],
  },
  {
    id: "tools",
    name: "Tools",
    kanji: "具",
    items: ["Git", "GitHub", "Branching", "Pull Requests", "PyCharm", "VS Code", "Google Colab", "draw.io"],
  },
  {
    id: "multimodal",
    name: "Multimodal AI",
    kanji: "感",
    items: ["Computer Vision", "Speech-to-Text", "Text-to-Speech", "Voice Interaction", "Image Processing", "Audio Processing"],
  },
];

export const scenes = [
  { id: "opening", label: "Opening", short: "壱" },
  { id: "character", label: "Character Profile", short: "弐" },
  { id: "journey", label: "The Journey", short: "参" },
  { id: "missions", label: "Mission Archives", short: "肆" },
  { id: "research", label: "Research Archives", short: "伍" },
  { id: "education", label: "Knowledge Foundation", short: "陸" },
  { id: "achievements", label: "Achievement Archives", short: "漆" },
  { id: "arsenal", label: "Technical Arsenal", short: "捌" },
  { id: "contact", label: "Let's Connect", short: "玖" },
  { id: "finale", label: "Final Flame", short: "拾" },
] as const;

export type SceneId = (typeof scenes)[number]["id"];
