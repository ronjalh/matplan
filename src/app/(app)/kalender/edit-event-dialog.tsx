"use client";

import { useState } from "react";
import { updateEvent, removeEvent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, Trash2 } from "lucide-react";

const eventTypes = [
  { value: "aktivitet", label: "Aktivitet", color: "var(--color-fish)" },
  { value: "avtale", label: "Avtale", color: "var(--color-terracotta)" },
  { value: "paamminnelse", label: "Påminnelse", color: "var(--color-warning)" },
  { value: "hendelse", label: "Hendelse", color: "var(--muted-foreground)" },
];

interface EditEventDialogProps {
  event: {
    id: number;
    title: string;
    eventType: string;
    startTime: string | null;
    endTime: string | null;
  };
  onClose: () => void;
}

export function EditEventDialog({ event, onClose }: EditEventDialogProps) {
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [eventType, setEventType] = useState(event.eventType);
  const [startTime, setStartTime] = useState(event.startTime ?? "");
  const [endTime, setEndTime] = useState(event.endTime ?? "");

  async function handleSave() {
    if (!title.trim() || pending) return;
    setPending(true);
    await updateEvent(event.id, {
      title: title.trim(),
      eventType,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    });
    setPending(false);
    onClose();
  }

  async function handleDelete() {
    if (!confirm("Slette hendelsen?")) return;
    await removeEvent(event.id);
    onClose();
  }

  return (
    <Card className="p-4 border-primary">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Rediger hendelse</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="edit-title" className="text-xs">Tittel</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <div className="flex flex-wrap gap-1.5">
            {eventTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setEventType(t.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                  eventType === t.value
                    ? "border-current"
                    : "border-transparent bg-muted text-muted-foreground"
                }`}
                style={eventType === t.value ? { color: t.color, backgroundColor: t.color + "1A" } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Fra</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => {
                const newStart = e.target.value;
                setStartTime(newStart);
                if (newStart && (!endTime || endTime <= newStart)) {
                  const [h, m] = newStart.split(":").map(Number);
                  setEndTime(`${String(Math.min(h + 1, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
                }
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Til</Label>
            <Input type="time" value={endTime} min={startTime || undefined} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={pending} size="sm" className="flex-1">
            {pending ? "Lagrer..." : "Lagre"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
