"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Field, Input, Select, SaveButton, SaveToast, useSaveFlash,
} from "@/components/ui/FormPrimitives";
import { getStoredLearning, setStoredLearning } from "@/lib/store";
import type { LearningSnapshot, LearningPath } from "@/lib/beecodefi";

export function LearningEntry({ onSaved }: { onSaved?: () => void }) {
  const [snapshot, setSnapshot] = useState<LearningSnapshot>({
    currentPath: null,
    streakDays: 0,
    studiedToday: false,
    recentActivity: [],
    upcomingReviews: [],
    coursesCompleted: 0,
    quizzesCompleted: 0,
    tutorialsCompleted: 0,
    lastSyncedAt: null,
  });
  const { saved, showSaved } = useSaveFlash();

  useEffect(() => {
    const stored = getStoredLearning();
    if (stored) setSnapshot(stored);
  }, []);

  const update = (patch: Partial<LearningSnapshot>) => {
    setSnapshot((prev) => ({ ...prev, ...patch }));
  };

  const setPath = (patch: Partial<LearningPath>) => {
    const current = snapshot.currentPath ?? { id: "path-1", title: "", progress: 0, totalLessons: 0, completedLessons: 0, etaMinutes: null };
    update({ currentPath: { ...current, ...patch } });
  };

  const save = () => {
    setStoredLearning(snapshot);
    showSaved();
    onSaved?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <SaveToast visible={saved} />
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-1">Learning State</h3>
        <SaveButton onClick={save} />
      </div>

      <GlassPanel className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field label="Streak (days)">
            <Input type="number" value={snapshot.streakDays} onChange={(e) => update({ streakDays: Number(e.target.value) })} />
          </Field>
          <Field label="Studied today">
            <Select value={snapshot.studiedToday ? "yes" : "no"} onChange={(e) => update({ studiedToday: e.target.value === "yes" })}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </Field>
        </div>

        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3 mb-3">Completion Stats</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field label="Courses completed">
            <Input type="number" min={0} value={snapshot.coursesCompleted} onChange={(e) => update({ coursesCompleted: Number(e.target.value) })} />
          </Field>
          <Field label="Quizzes completed">
            <Input type="number" min={0} value={snapshot.quizzesCompleted} onChange={(e) => update({ quizzesCompleted: Number(e.target.value) })} />
          </Field>
          <Field label="Tutorials completed">
            <Input type="number" min={0} value={snapshot.tutorialsCompleted} onChange={(e) => update({ tutorialsCompleted: Number(e.target.value) })} />
          </Field>
        </div>

        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3 mb-3">Current Path</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Title">
            <Input value={snapshot.currentPath?.title ?? ""} onChange={(e) => setPath({ title: e.target.value })} placeholder="Course name" />
          </Field>
          <Field label="Progress (0-100)">
            <Input type="number" min={0} max={100} value={snapshot.currentPath?.progress ?? 0} onChange={(e) => setPath({ progress: Number(e.target.value) })} />
          </Field>
          <Field label="Total lessons">
            <Input type="number" value={snapshot.currentPath?.totalLessons ?? 0} onChange={(e) => setPath({ totalLessons: Number(e.target.value) })} />
          </Field>
          <Field label="Completed lessons">
            <Input type="number" value={snapshot.currentPath?.completedLessons ?? 0} onChange={(e) => setPath({ completedLessons: Number(e.target.value) })} />
          </Field>
        </div>
      </GlassPanel>
    </div>
  );
}
