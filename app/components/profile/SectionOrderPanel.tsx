"use client";

import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext,
  sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SectionKey, SectionConfig } from "@/lib/hooks/profile";

function SortableItem({ id, label, index }: { id: string; label: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      {...attributes}
      {...listeners}
    >
      <span className="text-neutral-400 text-xs">⋮⋮</span>
      <span className="font-mono text-sm text-neutral-600 flex-1">{label}</span>
      <span className="font-mono text-xs text-neutral-300">{index + 1}</span>
    </div>
  );
}

interface Props {
  sectionOrder: SectionKey[];
  sectionConfig: SectionConfig[];
  onReorder: (newConfig: SectionConfig[]) => void;
}

export function SectionOrderPanel({ sectionOrder, sectionConfig, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionOrder.indexOf(active.id as SectionKey);
    const newIndex = sectionOrder.indexOf(over.id as SectionKey);
    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
    const newConfig = newOrder.map((key) => sectionConfig.find((s) => s.key === key) ?? { key, visible: true });
    onReorder(newConfig);
  };

  return (
    <div className="w-full md:w-56 shrink-0 order-first md:order-none">
      <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 md:sticky md:top-6">
        <h3 className="font-mono font-semibold text-sm text-neutral-800 mb-3">Section Order</h3>
        <p className="font-mono text-xs text-neutral-400 mb-4">Drag to reorder</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sectionOrder.map((key, index) => (
                <SortableItem
                  key={key}
                  id={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
