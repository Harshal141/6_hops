"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GridBackground, Navbar, Footer, BackButton } from "../../components";
import {
  ProfileHeader,
  AboutSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  LinksSection,
} from "../../components/profile";
import { normalizeProfile, type Profile, type SectionKey, type SectionConfig, DEFAULT_SECTION_CONFIG } from "@/lib/hooks/profile";
import { useConnectionStatus } from "@/lib/hooks/connection";
import { ConnectRequestModal } from "../../components/connections/ConnectRequestModal";
import { ConnectionStatusAction } from "../../components/connections/ConnectionStatusAction";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  // The URL segment is the public slug (`users.user_id`), not the internal
  // UUID — profile.id (once loaded) is what connection/graph lookups need.
  const handle = params.userId as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Connection state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const connectionStatus = useConnectionStatus(profile?.id ?? "");

  // Redirect to own profile page if viewing self
  useEffect(() => {
    if (session?.user?.handle && session.user.handle === handle) {
      router.replace("/profile");
    }
  }, [session, handle, router]);

  // Fetch the other user's profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile/${handle}`);
        if (!res.ok) {
          setError("Profile not found");
          return;
        }
        const data = await res.json();
        setProfile(normalizeProfile(data));
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [handle]);


  // ── Loading / error states ─────────────────────────────────

  if (loading) return (
    <GridBackground><Navbar />
      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <span className="font-mono text-neutral-400">loading...</span>
        <BackButton />
      </main>
    <Footer /></GridBackground>
  );

  if (error || !profile) return (
    <GridBackground><Navbar />
      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <span className="font-mono text-neutral-400">{error ?? "Profile not found"}</span>
        <BackButton />
      </main>
    <Footer /></GridBackground>
  );

  const sectionConfig: SectionConfig[] = profile.section_config ?? DEFAULT_SECTION_CONFIG;
  const sectionOrder: SectionKey[] = sectionConfig.filter((s) => s.visible).map((s) => s.key);
  const hasContent = profile.bio || profile.skills.length > 0 || profile.experience.length > 0 || profile.education.length > 0 || profile.links.length > 0;

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "about":
        return profile.bio ? <AboutSection key={key} bio={profile.bio} isEditing={false} onChange={() => {}} /> : null;
      case "skills":
        return profile.skills.length > 0 ? <SkillsSection key={key} skills={profile.skills} isEditing={false} onAdd={() => {}} onRemove={() => {}} /> : null;
      case "experience":
        return profile.experience.length > 0 ? <ExperienceSection key={key} experience={profile.experience} isEditing={false} onAdd={() => {}} onChange={() => {}} onRemove={() => {}} /> : null;
      case "education":
        return profile.education.length > 0 ? <EducationSection key={key} education={profile.education} isEditing={false} onAdd={() => {}} onChange={() => {}} onRemove={() => {}} /> : null;
      case "links":
        return profile.links.length > 0 ? <LinksSection key={key} links={profile.links} isEditing={false} onChange={() => {}} onRemove={() => {}} onAdd={() => {}} /> : null;
      default:
        return null;
    }
  };

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-6 overflow-auto">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <BackButton />
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sm:p-8">

            {/* In-flow bar, same treatment as the profile-owner's edit button — an
                absolute button floats over the header and collides with long names/titles. */}
            <div className="flex justify-end mb-4">
              <ConnectionStatusAction
                status={connectionStatus}
                targetName={profile.name}
                onConnect={() => setShowConnectModal(true)}
              />
            </div>

            <ProfileHeader view={profile} isEditing={false} onChange={() => {}} />

            {hasContent ? (
              sectionOrder.map((key) => renderSection(key))
            ) : (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3 opacity-20">◐</div>
                <p className="font-mono text-sm text-neutral-400">
                  This profile is not yet complete
                </p>
                <p className="font-mono text-xs text-neutral-300 mt-1">
                  {profile.name} hasn&apos;t added their details yet
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {showConnectModal && (
        <ConnectRequestModal
          targetId={profile.id}
          targetName={profile.name ?? "this person"}
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </GridBackground>
  );
}
