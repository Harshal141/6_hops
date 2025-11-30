"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GridBackground, Navbar, Footer } from "../components";

interface User {
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

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

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

  if (!user) {
    return (
      <GridBackground>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <span className="font-mono text-neutral-400">
            failed to load profile
          </span>
        </main>
        <Footer />
      </GridBackground>
    );
  }

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-8 py-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Resume Card */}
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-8">
            {/* Header */}
            <div className="flex items-start gap-6 mb-8 pb-6 border-b border-neutral-200">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-200">
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="font-mono font-bold text-3xl text-neutral-800">
                  {user.name}
                </h1>
                <p className="font-mono text-lg text-neutral-500 mt-1">
                  {user.title}
                </p>
                <p className="font-mono text-sm text-neutral-400 mt-2">
                  {user.location} · {user.email}
                </p>
                <div className="flex gap-3 mt-3">
                  {user.links.map((link) => (
                    <a
                      key={link.type}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                      [{link.type}]
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio */}
            <section className="mb-8">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
                About
              </h2>
              <p className="font-mono text-neutral-600 leading-relaxed">
                {user.bio}
              </p>
            </section>

            {/* Skills */}
            <section className="mb-8">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-xs px-3 py-1 bg-neutral-100 text-neutral-600 border border-neutral-200"
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
                {user.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-neutral-200 pl-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-mono font-semibold text-neutral-800">
                        {exp.role}
                      </h3>
                      <span className="font-mono text-xs text-neutral-400">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-neutral-500">
                      {exp.company}
                    </p>
                    <p className="font-mono text-sm text-neutral-600 mt-1">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
                Education
              </h2>
              <div className="space-y-2">
                {user.education.map((edu, index) => (
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
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
