"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GridBackground, Navbar, Footer } from "../../components";

// Redirect to home page - coming soon mode
redirect("/");

interface PathConnection {
  id: string;
  name: string;
  title: string;
  company: string;
  emoji: string;
  isYou?: boolean;
  isTarget?: boolean;
}

interface TargetUser {
  id: string;
  name: string;
  title: string;
  company: string;
  emoji: string;
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
  industry: string;
  mutualConnections: number;
}

// Mock data for the connection path
const mockConnectionPaths: Record<string, PathConnection[]> = {
  "1": [
    { id: "you", name: "You", title: "Your current role", company: "", emoji: "🧑‍💻", isYou: true },
    { id: "c1", name: "Alex Kumar", title: "Senior Engineer", company: "TechCorp", emoji: "👨‍🔧" },
    { id: "1", name: "Sarah Chen", title: "VP of Engineering", company: "TechCorp", emoji: "👩‍💼", isTarget: true },
  ],
  "2": [
    { id: "you", name: "You", title: "Your current role", company: "", emoji: "🧑‍💻", isYou: true },
    { id: "c1", name: "Maria Santos", title: "Product Lead", company: "StartupX", emoji: "👩‍🎨" },
    { id: "c2", name: "James Liu", title: "Head of Product", company: "FinanceHub", emoji: "👨‍💼" },
    { id: "2", name: "Michael Rodriguez", title: "Director of Product", company: "FinanceHub", emoji: "🧔", isTarget: true },
  ],
  "3": [
    { id: "you", name: "You", title: "Your current role", company: "", emoji: "🧑‍💻", isYou: true },
    { id: "c1", name: "Dr. Priya Sharma", title: "Medical Director", company: "HealthFirst", emoji: "👩‍⚕️" },
    { id: "3", name: "Emily Watson", title: "CTO", company: "HealthFirst", emoji: "👩‍🔬", isTarget: true },
  ],
  "4": [
    { id: "you", name: "You", title: "Your current role", company: "", emoji: "🧑‍💻", isYou: true },
    { id: "c1", name: "Tom Wilson", title: "Sales Manager", company: "SalesForce", emoji: "👨‍💼" },
    { id: "c2", name: "Linda Park", title: "VP Sales", company: "RetailPro", emoji: "👩‍💼" },
    { id: "c3", name: "John Baker", title: "Director", company: "RetailPro", emoji: "🧑‍🦰" },
    { id: "4", name: "David Kim", title: "Senior Manager", company: "RetailPro", emoji: "👨‍🏫", isTarget: true },
  ],
  "5": [
    { id: "you", name: "You", title: "Your current role", company: "", emoji: "🧑‍💻", isYou: true },
    { id: "c1", name: "Rachel Green", title: "Energy Consultant", company: "GreenEnergy", emoji: "👩‍🌾" },
    { id: "c2", name: "Mark Johnson", title: "Operations Head", company: "EnergyFlow", emoji: "👷" },
    { id: "5", name: "Lisa Thompson", title: "Board Member", company: "EnergyFlow", emoji: "👩‍⚖️", isTarget: true },
  ],
  "6": [
    { id: "you", name: "You", title: "Your current role", company: "", emoji: "🧑‍💻", isYou: true },
    { id: "c1", name: "Chris Martin", title: "Content Creator", company: "YouTube", emoji: "🎬" },
    { id: "c2", name: "Anna Lee", title: "Media Director", company: "MediaGroup", emoji: "👩‍🎤" },
    { id: "c3", name: "Robert Chang", title: "VP Content", company: "MediaWave", emoji: "🧑‍🎨" },
    { id: "c4", name: "Sophie Davis", title: "COO", company: "MediaWave", emoji: "👩‍💻" },
    { id: "6", name: "James Park", title: "CEO", company: "MediaWave", emoji: "🎯", isTarget: true },
  ],
};

// Mock target user data
const mockTargetUsers: Record<string, TargetUser> = {
  "1": {
    id: "1",
    name: "Sarah Chen",
    title: "VP of Engineering",
    company: "TechCorp",
    emoji: "👩‍💼",
    location: "San Francisco, CA",
    bio: "Engineering leader with 15+ years of experience building high-performance teams and scalable systems. Passionate about mentoring and creating inclusive engineering cultures.",
    skills: ["Engineering Leadership", "System Architecture", "Team Building", "Agile", "Cloud Infrastructure"],
    experience: [
      { company: "TechCorp", role: "VP of Engineering", duration: "2021 - Present", description: "Leading a team of 150+ engineers across multiple product lines." },
      { company: "StartupAI", role: "Director of Engineering", duration: "2018 - 2021", description: "Built the engineering team from 5 to 50 engineers." },
    ],
    education: [
      { institution: "Stanford University", degree: "MS Computer Science", year: "2008" },
      { institution: "UC Berkeley", degree: "BS Electrical Engineering", year: "2006" },
    ],
    industry: "Technology",
    mutualConnections: 3,
  },
  "2": {
    id: "2",
    name: "Michael Rodriguez",
    title: "Director of Product",
    company: "FinanceHub",
    emoji: "🧔",
    location: "New York, NY",
    bio: "Product leader focused on fintech innovation. Previously built products used by millions at top financial institutions.",
    skills: ["Product Strategy", "Fintech", "User Research", "Roadmapping", "Data Analytics"],
    experience: [
      { company: "FinanceHub", role: "Director of Product", duration: "2020 - Present", description: "Leading product strategy for consumer banking products." },
      { company: "PaymentsCo", role: "Senior Product Manager", duration: "2017 - 2020", description: "Launched mobile payments feature with 2M+ users." },
    ],
    education: [
      { institution: "Harvard Business School", degree: "MBA", year: "2017" },
      { institution: "MIT", degree: "BS Economics", year: "2012" },
    ],
    industry: "Finance & Banking",
    mutualConnections: 1,
  },
  "3": {
    id: "3",
    name: "Emily Watson",
    title: "CTO",
    company: "HealthFirst",
    emoji: "👩‍🔬",
    location: "Boston, MA",
    bio: "Healthcare technology executive driving digital transformation in patient care. Strong advocate for health equity and accessibility.",
    skills: ["Healthcare IT", "Digital Health", "HIPAA Compliance", "AI/ML", "Interoperability"],
    experience: [
      { company: "HealthFirst", role: "CTO", duration: "2019 - Present", description: "Overseeing technology strategy and digital health initiatives." },
      { company: "MedTech Solutions", role: "VP Engineering", duration: "2015 - 2019", description: "Led development of FDA-approved diagnostic platform." },
    ],
    education: [
      { institution: "Johns Hopkins University", degree: "PhD Biomedical Engineering", year: "2010" },
    ],
    industry: "Healthcare & Life Sciences",
    mutualConnections: 5,
  },
  "4": {
    id: "4",
    name: "David Kim",
    title: "Senior Manager",
    company: "RetailPro",
    emoji: "👨‍🏫",
    location: "Los Angeles, CA",
    bio: "Retail operations expert with deep experience in supply chain optimization and omnichannel strategy.",
    skills: ["Retail Operations", "Supply Chain", "E-commerce", "Inventory Management", "Team Leadership"],
    experience: [
      { company: "RetailPro", role: "Senior Manager", duration: "2021 - Present", description: "Managing West Coast retail operations and logistics." },
      { company: "ShopMart", role: "Operations Manager", duration: "2018 - 2021", description: "Improved fulfillment efficiency by 35%." },
    ],
    education: [
      { institution: "UCLA Anderson", degree: "MBA Operations", year: "2018" },
    ],
    industry: "Retail & Consumer",
    mutualConnections: 2,
  },
  "5": {
    id: "5",
    name: "Lisa Thompson",
    title: "Board Member",
    company: "EnergyFlow",
    emoji: "👩‍⚖️",
    location: "Houston, TX",
    bio: "Energy sector veteran with 25+ years of experience. Focused on the transition to renewable energy and sustainable business practices.",
    skills: ["Board Governance", "Energy Strategy", "Sustainability", "M&A", "Executive Leadership"],
    experience: [
      { company: "EnergyFlow", role: "Board Member", duration: "2022 - Present", description: "Advising on strategic initiatives and governance." },
      { company: "PetroCorp", role: "CEO", duration: "2015 - 2022", description: "Led company through successful energy transition." },
    ],
    education: [
      { institution: "Rice University", degree: "MBA", year: "1998" },
      { institution: "Texas A&M", degree: "BS Petroleum Engineering", year: "1995" },
    ],
    industry: "Energy & Utilities",
    mutualConnections: 1,
  },
  "6": {
    id: "6",
    name: "James Park",
    title: "CEO",
    company: "MediaWave",
    emoji: "🎯",
    location: "Los Angeles, CA",
    bio: "Media entrepreneur who has built multiple successful content platforms. Believer in the power of storytelling to change the world.",
    skills: ["Media Strategy", "Content Creation", "Business Development", "Fundraising", "Leadership"],
    experience: [
      { company: "MediaWave", role: "CEO", duration: "2018 - Present", description: "Founded and scaled streaming platform to 10M+ subscribers." },
      { company: "ContentLab", role: "Co-founder", duration: "2012 - 2018", description: "Built digital content studio acquired by major network." },
    ],
    education: [
      { institution: "USC School of Cinematic Arts", degree: "MFA Film Production", year: "2010" },
    ],
    industry: "Media & Entertainment",
    mutualConnections: 2,
  },
};

export default function ConnectionPath() {
  const params = useParams();
  const connectionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<PathConnection[]>([]);
  const [targetUser, setTargetUser] = useState<TargetUser | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const pathData = mockConnectionPaths[connectionId] || [];
      const userData = mockTargetUsers[connectionId] || null;

      setPath(pathData);
      setTargetUser(userData);
      setLoading(false);
    };

    fetchData();
  }, [connectionId]);

  if (loading) {
    return (
      <GridBackground>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <span className="font-mono text-neutral-400">loading...</span>
        </main>
        <Footer />
      </GridBackground>
    );
  }

  if (!targetUser || path.length === 0) {
    return (
      <GridBackground>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="font-mono text-neutral-400 block mb-4">
              Connection not found
            </span>
            <Link
              href="/dashboard"
              className="font-mono text-sm text-neutral-600 hover:text-neutral-800 underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </GridBackground>
    );
  }

  const hopCount = path.length - 1;

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-8 py-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-mono text-sm text-neutral-500 hover:text-neutral-800 mb-6 transition-colors"
          >
            <span>←</span> Back to Discover
          </Link>

          {/* Connection Path Visualization */}
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono font-semibold text-neutral-800">
                Connection Path
              </h2>
              <span
                className={`px-2 py-1 font-mono text-xs ${
                  hopCount <= 2
                    ? "bg-green-100 text-green-700"
                    : hopCount <= 4
                    ? "bg-blue-100 text-blue-700"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {hopCount} {hopCount === 1 ? "hop" : "hops"} away
              </span>
            </div>

            {/* Path Visualization */}
            <div className="flex items-center overflow-x-auto py-6 px-2">
              {path.map((person, index) => (
                <div key={person.id} className="flex items-center">
                  {/* Person Node */}
                  <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                        person.isYou
                          ? "border-neutral-800 bg-neutral-800"
                          : person.isTarget
                          ? "border-neutral-800 bg-white"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {person.isYou ? (
                        <Image
                          src="/user-avatar.png"
                          alt="You"
                          width={52}
                          height={52}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{person.emoji}</span>
                      )}
                    </div>

                    {/* Name & Info */}
                    <div className="mt-2 text-center max-w-[100px]">
                      <p className="font-mono text-xs font-semibold text-neutral-800 truncate">
                        {person.isYou ? "You" : person.name.split(" ")[0]}
                      </p>
                      {!person.isYou && (
                        <>
                          <p className="font-mono text-[10px] text-neutral-500 truncate">
                            {person.title}
                          </p>
                          {person.company && (
                            <p className="font-mono text-[10px] text-neutral-400 truncate">
                              {person.company}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Hop indicator */}
                    {index > 0 && (
                      <span className="mt-1 font-mono text-[9px] text-neutral-400">
                        hop {index}
                      </span>
                    )}
                  </div>

                  {/* Connector Line */}
                  {index < path.length - 1 && (
                    <div className="flex items-center mx-3 -mt-8">
                      <div className="w-12 h-px bg-neutral-300 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* How to Connect Instructions */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="font-mono text-xs text-neutral-500 mb-3">
                Suggested approach:
              </p>
              <ol className="space-y-2">
                {path.slice(1, -1).map((person, index) => (
                  <li
                    key={person.id}
                    className="flex items-start gap-2 font-mono text-sm text-neutral-600"
                  >
                    <span className="bg-neutral-100 text-neutral-500 w-5 h-5 flex items-center justify-center text-xs shrink-0">
                      {index + 1}
                    </span>
                    <span>
                      Ask <span className="font-semibold">{index === 0 ? "your connection" : path[index].name}</span> to introduce you to{" "}
                      <span className="font-semibold">{person.name}</span>
                      {person.company && (
                        <span className="text-neutral-400"> at {person.company}</span>
                      )}
                    </span>
                  </li>
                ))}
                <li className="flex items-start gap-2 font-mono text-sm text-neutral-600">
                  <span className="bg-blue-100 text-blue-600 w-5 h-5 flex items-center justify-center text-xs shrink-0">
                    {path.length - 2}
                  </span>
                  <span>
                    <span className="font-semibold">{path[path.length - 2]?.name}</span> can introduce you to{" "}
                    <span className="font-semibold text-blue-600">{targetUser.name}</span>
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* Target User Profile */}
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-8">
            {/* Header */}
            <div className="flex items-start gap-6 mb-8 pb-6 border-b border-neutral-200">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-200 shrink-0 bg-blue-50 flex items-center justify-center">
                <span className="text-5xl">
                  {targetUser.emoji}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-mono font-bold text-3xl text-neutral-800">
                      {targetUser.name}
                    </h1>
                    <p className="font-mono text-lg text-neutral-500 mt-1">
                      {targetUser.title}
                    </p>
                    <p className="font-mono text-sm text-neutral-400 mt-2">
                      {targetUser.company} · {targetUser.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-neutral-400">mutual connections</p>
                    <p className="font-mono text-2xl font-semibold text-neutral-800">
                      {targetUser.mutualConnections}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <section className="mb-8">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
                About
              </h2>
              <p className="font-mono text-neutral-600 leading-relaxed">
                {targetUser.bio}
              </p>
            </section>

            {/* Skills */}
            <section className="mb-8">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {targetUser.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="font-mono text-xs px-3 py-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section className="mb-8">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {targetUser.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-neutral-200 pl-4">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-mono font-semibold text-neutral-800">
                        {exp.role}
                      </h3>
                      <span className="font-mono text-xs text-neutral-400">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-neutral-500">{exp.company}</p>
                    <p className="font-mono text-sm text-neutral-600 mt-1">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="mb-8">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
                Education
              </h2>
              <div className="space-y-4">
                {targetUser.education.map((edu, index) => (
                  <div key={index} className="flex items-baseline justify-between">
                    <div>
                      <h3 className="font-mono font-semibold text-neutral-800">
                        {edu.degree}
                      </h3>
                      <p className="font-mono text-sm text-neutral-500">
                        {edu.institution}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-neutral-400">
                      {edu.year}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Industry Tag */}
            <div className="pt-4 border-t border-neutral-200">
              <span className="font-mono text-xs text-neutral-400">Industry: </span>
              <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-1">
                {targetUser.industry}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
