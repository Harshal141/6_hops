export interface User {
  id: number;
  name: string;
  title: string;
  email: string;
  avatarUrl: string;
  location: string;
  bio: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  links: {
    type: string;
    url: string;
  }[];
}

export const currentUser: User = {
  id: 1,
  name: "Harshal Patil",
  title: "Software Engineer",
  email: "harshal@example.com",
  avatarUrl: "/user-avatar.png",
  location: "San Francisco, CA",
  bio: "Passionate software engineer with expertise in building scalable web applications. Love connecting with people and exploring new technologies.",
  skills: ["TypeScript", "React", "Next.js", "Node.js", "Python", "GraphQL"],
  experience: [
    {
      company: "TechCorp",
      role: "Senior Software Engineer",
      duration: "2022 - Present",
      description: "Leading frontend architecture and building scalable web applications.",
    },
    {
      company: "StartupXYZ",
      role: "Software Engineer",
      duration: "2020 - 2022",
      description: "Full-stack development with React and Node.js.",
    },
  ],
  education: [
    {
      institution: "University of Technology",
      degree: "B.S. Computer Science",
      year: "2020",
    },
  ],
  links: [
    { type: "github", url: "https://github.com" },
    { type: "linkedin", url: "https://linkedin.com" },
    { type: "twitter", url: "https://twitter.com" },
  ],
};
