import { Topic, TopicCategory, AudienceType } from "./types";

export const TIMER_PRESETS = [30, 60, 90, 120, 180, 300] as const;
export const DEFAULT_TIMER = 60;

export const AUDIENCE_LABELS: Record<AudienceType, string> = {
  child: "a 10-year-old child",
  teenager: "a teenager",
  "non-technical": "a non-technical adult",
  peer: "a peer with similar expertise",
  executive: "a business executive",
  interviewer: "a job interviewer",
};

export const TOPIC_CONCEPTS: Record<string, string[]> = {
  JavaScript: [
    "closures",
    "promises",
    "the event loop",
    "prototypal inheritance",
    "async/await",
    "hoisting",
    "higher-order functions",
    "the DOM",
  ],
  Python: [
    "decorators",
    "generators",
    "list comprehensions",
    "the GIL",
    "duck typing",
    "context managers",
    "virtual environments",
    "dunder methods",
  ],
  "Machine Learning": [
    "gradient descent",
    "overfitting",
    "neural networks",
    "supervised vs unsupervised learning",
    "backpropagation",
    "bias-variance tradeoff",
    "decision trees",
    "cross-validation",
  ],
  "Web Development": [
    "REST APIs",
    "CORS",
    "cookies vs sessions",
    "DNS resolution",
    "HTTPS/TLS",
    "caching strategies",
    "WebSockets",
    "responsive design",
  ],
  Databases: [
    "SQL joins",
    "indexing",
    "ACID properties",
    "normalization",
    "NoSQL vs SQL",
    "transactions",
    "connection pooling",
    "sharding",
  ],
  "Operating Systems": [
    "processes vs threads",
    "virtual memory",
    "deadlocks",
    "file systems",
    "context switching",
    "scheduling algorithms",
    "system calls",
    "page replacement",
  ],
  Networking: [
    "TCP vs UDP",
    "HTTP/2",
    "load balancing",
    "CDNs",
    "the OSI model",
    "subnetting",
    "packet routing",
    "firewalls",
  ],
  "Data Structures": [
    "hash tables",
    "binary trees",
    "linked lists vs arrays",
    "graphs",
    "stacks and queues",
    "heaps",
    "tries",
    "B-trees",
  ],
  Physics: [
    "gravity",
    "quantum entanglement",
    "thermodynamics",
    "special relativity",
    "electromagnetic waves",
    "entropy",
    "wave-particle duality",
    "Newton's laws",
  ],
  Economics: [
    "supply and demand",
    "inflation",
    "opportunity cost",
    "game theory",
    "monetary policy",
    "comparative advantage",
    "market equilibrium",
    "externalities",
  ],
};

export const PRESET_TOPICS: Topic[] = [
  { id: "javascript", name: "JavaScript", category: "technology" },
  { id: "python", name: "Python", category: "technology" },
  { id: "ml", name: "Machine Learning", category: "technology" },
  { id: "webdev", name: "Web Development", category: "technology" },
  { id: "databases", name: "Databases", category: "technology" },
  { id: "os", name: "Operating Systems", category: "technology" },
  { id: "networking", name: "Networking", category: "technology" },
  { id: "dsa", name: "Data Structures", category: "technology" },
  { id: "physics", name: "Physics", category: "science" },
  { id: "economics", name: "Economics", category: "humanities" },
];

export const MAX_PERSONA_LENGTH = 50;

export const CATEGORY_COLORS: Record<TopicCategory, string> = {
  technology: "bg-blue-100 text-blue-800 border-blue-200",
  science: "bg-purple-100 text-purple-800 border-purple-200",
  humanities: "bg-amber-100 text-amber-800 border-amber-200",
  business: "bg-green-100 text-green-800 border-green-200",
  lifestyle: "bg-pink-100 text-pink-800 border-pink-200",
  custom: "bg-gray-100 text-gray-800 border-gray-200",
};
