"use client";

import { useState } from "react";
import { addEvent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

const eventTypes = [
  { value: "aktivitet", label: "Aktivitet", color: "var(--color-fish)" },
  { value: "avtale", label: "Avtale", color: "var(--color-terracotta)" },
  { value: "paamminnelse", label: "Påminnelse", color: "var(--color-warning)" },
  { value: "hendelse", label: "Hendelse", color: "var(--muted-foreground)" },
];

interface AddEventDialogProps {
  date: string;
  onClose: () => void;
}

export function AddEventDialog({ date, onClose }: AddEventDialogProps) {
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("aktivitet");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || pending) return;
    setPending(true);
    await addEvent(date, title.trim(), eventType, startTime || undefined, endTime || undefined);
    setPending(false);
    onClose();
  }

  return (
    <Card className="p-4 border-primary">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Ny hendelse</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="event-title" className="text-xs">Tittel *</Label>
          <Input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="F.eks. Trening, Tannlege..."
            required
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
            <Label htmlFor="start-time" className="text-xs">Fra</Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => {
                const newStart = e.target.value;
                setStartTime(newStart);
                // Auto-fill end time to +1 hour if empty or before new start
                if (newStart) {
                  const [h, m] = newStart.split(":").map(Number);
                  const autoEnd = `${String(Math.min(h + 1, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                  if (!endTime || endTime <= newStart) {
                    setEndTime(autoEnd);
                  }
                }
              }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end-time" className="text-xs">Til</Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              min={startTime || undefined}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={pending} className="w-full" size="sm">
          {pending ? "Lagrer..." : "Legg til"}
        </Button>
      </form>
    </Card>
  );
}
