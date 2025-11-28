export interface Connection {
  id: number;
  name: string;
  title: string;
  isStarred: boolean;
  isOnline: boolean;
  avatarUrl?: string;
}

// Direct connections (1st degree)
export const connections: Connection[] = [
  { id: 1, name: "Alex Chen", title: "Software Engineer", isStarred: true, isOnline: true },
  { id: 2, name: "Sarah Miller", title: "Product Designer", isStarred: false, isOnline: true },
  { id: 3, name: "James Wilson", title: "Data Scientist", isStarred: true, isOnline: false },
  { id: 4, name: "Emma Davis", title: "Frontend Dev", isStarred: false, isOnline: true },
  { id: 5, name: "Michael Brown", title: "Tech Lead", isStarred: true, isOnline: false },
  { id: 6, name: "Lisa Anderson", title: "UX Researcher", isStarred: false, isOnline: false },
  { id: 7, name: "David Kim", title: "Backend Dev", isStarred: false, isOnline: true },
  { id: 8, name: "Rachel Green", title: "PM", isStarred: true, isOnline: true },
];

// Indirect connections (2+ degrees - reachable through direct connections)
export const indirectConnections: Connection[] = [
  { id: 101, name: "Tom Harris", title: "CTO @ TechCorp", isStarred: false, isOnline: true },
  { id: 102, name: "Nina Patel", title: "Investor", isStarred: true, isOnline: false },
  { id: 103, name: "Chris Evans", title: "Startup Founder", isStarred: false, isOnline: true },
  { id: 104, name: "Amy Zhang", title: "AI Researcher", isStarred: true, isOnline: true },
  { id: 105, name: "Robert Lee", title: "VP Engineering", isStarred: false, isOnline: false },
  { id: 106, name: "Jessica Moore", title: "Product Lead", isStarred: false, isOnline: true },
  { id: 107, name: "Daniel Park", title: "Senior Architect", isStarred: true, isOnline: false },
  { id: 108, name: "Maria Garcia", title: "Design Director", isStarred: false, isOnline: true },
  { id: 109, name: "Kevin Wu", title: "ML Engineer", isStarred: false, isOnline: false },
  { id: 110, name: "Sophie Turner", title: "Growth Lead", isStarred: true, isOnline: true },
  { id: 111, name: "Ryan Johnson", title: "DevOps Lead", isStarred: false, isOnline: true },
  { id: 112, name: "Emily White", title: "Head of Product", isStarred: false, isOnline: false },
];
