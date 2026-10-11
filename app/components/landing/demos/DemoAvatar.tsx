import { Avatar } from "../../ui";
import { sampleFaceUrl } from "@/lib/utils/sampleAvatars";
import type { DemoPerson } from "../landingContent";

interface DemoAvatarProps {
  person: DemoPerson;
  size?: "sm" | "md" | "lg";
  /** Emphasis ring, e.g. "you" or a person on the highlighted path. */
  tone?: "default" | "self";
}

export function DemoAvatar({ person, size = "md", tone = "default" }: DemoAvatarProps) {
  return <Avatar src={sampleFaceUrl(person.face)} name={person.name} size={size} tone={tone} />;
}
