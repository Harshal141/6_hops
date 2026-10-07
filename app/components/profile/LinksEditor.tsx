"use client";

import { IconButton, Input, Select } from "../ui";
import { useProfileField } from "@/lib/hooks/profileEditor";
import { LINK_TYPES, LINK_TYPE_LABELS, PROFILE_LIMITS, type LinkType } from "@/lib/schemas/profile";
import { ListEditor } from "./ListEditor";

const TYPE_OPTIONS = LINK_TYPES.map((value) => ({ value, label: LINK_TYPE_LABELS[value] }));

function LinkRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const type = useProfileField(`links.${index}.type`);
  const url = useProfileField(`links.${index}.url`);
  return (
    <div className="flex items-start gap-2">
      <div className="w-28 shrink-0">
        <Select<LinkType> {...type} options={TYPE_OPTIONS} ariaLabel="Link type" />
      </div>
      <div className="flex-1 min-w-0">
        <Input {...url} type="url" placeholder="https://" ariaLabel="Link URL" />
      </div>
      <IconButton ariaLabel={`Remove ${LINK_TYPE_LABELS[type.value]} link`} tone="danger" onClick={onRemove}>
        ×
      </IconButton>
    </div>
  );
}

export function LinksEditor() {
  return (
    <ListEditor
      title="Links"
      name="links"
      max={PROFILE_LIMITS.links}
      blank={{ type: "linkedin", url: "" }}
      empty="No links added"
      renderRow={(index, remove) => <LinkRow index={index} onRemove={remove} />}
    />
  );
}
