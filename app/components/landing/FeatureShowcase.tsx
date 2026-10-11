"use client";

import { FeatureTile } from "./FeatureTile";
import { FEATURES } from "./landingContent";
import { InviteDemo, NoteDemo, OrbitDemo, PathDemo, ResumeDemo, SearchDemo } from "./demos";

/**
 * The features as a bento of live demos rather than a list: the headline
 * feature gets the wide tile, the rest share the rows below it.
 */
export function FeatureShowcase() {
  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-6">
      <div className="md:col-span-4">
        <FeatureTile feature={FEATURES.path} demo={(play) => <PathDemo play={play} />} />
      </div>
      <div className="md:col-span-2">
        <FeatureTile feature={FEATURES.strong} demo={(play) => <NoteDemo play={play} />} delay={100} />
      </div>
      <div className="md:col-span-2">
        <FeatureTile feature={FEATURES.graph} demo={(play) => <OrbitDemo play={play} />} />
      </div>
      <div className="md:col-span-2">
        <FeatureTile feature={FEATURES.discover} demo={(play) => <SearchDemo play={play} />} delay={100} />
      </div>
      <div className="md:col-span-2">
        <FeatureTile feature={FEATURES.resume} demo={(play) => <ResumeDemo play={play} />} delay={200} />
      </div>
      <div className="md:col-span-6">
        <FeatureTile feature={FEATURES.invite} demo={(play) => <InviteDemo play={play} />} layout="row" />
      </div>
    </div>
  );
}
