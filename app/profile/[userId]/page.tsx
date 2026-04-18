"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GridBackground, Navbar, Footer } from "../../components";
import {
  ProfileHeader,
  AboutSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  LinksSection,
} from "../../components/profile";
import { normalizeProfile, type Profile, type SectionKey, type SectionConfig, DEFAULT_SECTION_CONFIG } from "@/lib/hooks/profile";
import { useSendRequest, useSentRequests, useConnections } from "@/lib/hooks/connection";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Connection state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectNote, setConnectNote] = useState("");
  const sendRequest = useSendRequest();
  const { data: sentRequests } = useSentRequests();
  const { data: connections } = useConnections();

  // Redirect to own profile page if viewing self
  useEffect(() => {
    if (session?.user?.id && session.user.id === userId) {
      router.replace("/profile");
    }
  }, [session, userId, router]);

  // Fetch the other user's profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile/${userId}`);
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
  }, [userId]);

  // Check connection status
  const isPending = sentRequests?.some((r) => r.addressee_id === userId) ?? false;
  const isConnected = connections?.some(
    (c) => c.user_a_id === userId || c.user_b_id === userId
  ) ?? false;

  const handleSendRequest = async () => {
    if (!connectNote.trim()) return;
    try {
      await sendRequest.mutateAsync({ addresseeId: userId, note: connectNote });
      setShowConnectModal(false);
      setConnectNote("");
    } catch {
      // error is available via sendRequest.error
    }
  };

  // ── Loading / error states ─────────────────────────────────

  if (loading) return (
    <GridBackground><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <span className="font-mono text-neutral-400">loading...</span>
      </main>
    <Footer /></GridBackground>
  );

  if (error || !profile) return (
    <GridBackground><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <span className="font-mono text-neutral-400">{error ?? "Profile not found"}</span>
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
      <main className="flex-1 px-8 py-6 overflow-auto">
        <div className="mx-auto max-w-3xl">
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-8 relative">

            {/* Connection action button */}
            <div className="absolute top-4 right-4">
              {isConnected ? (
                <span className="font-mono text-xs px-3 py-1.5 bg-green-100 text-green-700 border border-green-200 rounded">
                  connected
                </span>
              ) : isPending ? (
                <span className="font-mono text-xs px-3 py-1.5 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded">
                  pending
                </span>
              ) : (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors rounded cursor-pointer"
                >
                  connect
                </button>
              )}
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

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowConnectModal(false)}
          />
          <div className="relative bg-white border border-neutral-200 p-6 w-full max-w-md mx-4 shadow-lg">
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-3 right-3 font-mono text-neutral-400 hover:text-neutral-800 text-lg cursor-pointer"
            >
              x
            </button>

            <h3 className="font-mono font-semibold text-neutral-800 mb-1">
              Connect with {profile.name}
            </h3>
            <p className="font-mono text-xs text-neutral-500 mb-4">
              Why is this person a strong connection for you?
            </p>

            <textarea
              value={connectNote}
              onChange={(e) => setConnectNote(e.target.value)}
              placeholder="e.g. We collaborated on a project at Acme Corp..."
              rows={4}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200
                       font-mono text-sm text-neutral-800 placeholder-neutral-400
                       focus:outline-none focus:border-neutral-400 focus:bg-white
                       transition-colors resize-none"
            />

            {sendRequest.isError && (
              <p className="font-mono text-xs text-red-500 mt-2">
                {sendRequest.error?.message ?? "Failed to send request"}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowConnectModal(false)}
                className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500
                         hover:bg-neutral-100 transition-colors rounded cursor-pointer"
              >
                cancel
              </button>
              <button
                onClick={handleSendRequest}
                disabled={!connectNote.trim() || sendRequest.isPending}
                className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white
                         hover:bg-neutral-700 transition-colors rounded cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendRequest.isPending ? "sending..." : "send request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </GridBackground>
  );
}
