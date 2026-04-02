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
  const [repeat, setRepeat] = useState("none");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || pending) return;
    setPending(true);

    if (repeat === "none") {
      await addEvent(date, title.trim(), eventType, startTime || undefined, endTime || undefined);
    } else {
      // Create multiple events based on repeat pattern
      const dates = generateRepeatDates(date, repeat);
      for (const d of dates) {
        await addEvent(d, title.trim(), eventType, startTime || undefined, endTime || undefined);
      }
    }

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
        <div className="space-y-1">
          <Label className="text-xs">Gjenta</Label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="none">Ikke gjenta</option>
            <option value="weekly-4">Hver uke (4 uker)</option>
            <option value="weekly-8">Hver uke (8 uker)</option>
            <option value="weekly-12">Hver uke (12 uker)</option>
            <option value="biweekly-8">Annenhver uke (8 uker)</option>
            <option value="monthly-3">Hver måned (3 mnd)</option>
            <option value="monthly-6">Hver måned (6 mnd)</option>
          </select>
        </div>
        <Button type="submit" disabled={pending} className="w-full" size="sm">
          {pending ? "Lagrer..." : repeat !== "none" ? "Legg til (flere hendelser)" : "Legg til"}
        </Button>
      </form>
    </Card>
  );
}

function generateRepeatDates(startDate: string, pattern: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const [type, countStr] = pattern.split("-");
  const count = parseInt(countStr) || 4;

  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    if (type === "weekly") {
      d.setDate(start.getDate() + i * 7);
    } else if (type === "biweekly") {
      d.setDate(start.getDate() + i * 14);
    } else if (type === "monthly") {
      d.setMonth(start.getMonth() + i);
    }
    dates.push(d.toISOString().split("T")[0]);
  }

  return dates;
}
