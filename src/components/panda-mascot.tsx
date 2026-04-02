/**
 * Matplan panda mascot — flat, cute design with pink cheeks.
 * Uses CSS variables to adapt to light/dark mode.
 */
export function PandaMascot({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Matplan-pandaen"
      className="inline-block"
    >
      {/* Ears */}
      <circle cx="25" cy="22" r="14" fill="var(--foreground)" opacity="0.75" />
      <circle cx="75" cy="22" r="14" fill="var(--foreground)" opacity="0.75" />
      <circle cx="25" cy="22" r="8" fill="var(--foreground)" opacity="0.3" />
      <circle cx="75" cy="22" r="8" fill="var(--foreground)" opacity="0.3" />
      {/* Head */}
      <circle cx="50" cy="52" r="36" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      {/* Eye patches */}
      <ellipse cx="36" cy="46" rx="11" ry="9" fill="var(--foreground)" opacity="0.75" transform="rotate(-8 36 46)" />
      <ellipse cx="64" cy="46" rx="11" ry="9" fill="var(--foreground)" opacity="0.75" transform="rotate(8 64 46)" />
      {/* Eyes — big and cute */}
      <circle cx="36" cy="45" r="5.5" fill="var(--card)" />
      <circle cx="64" cy="45" r="5.5" fill="var(--card)" />
      <circle cx="37.5" cy="44" r="2.5" fill="var(--foreground)" />
      <circle cx="65.5" cy="44" r="2.5" fill="var(--foreground)" />
      {/* Eye shine */}
      <circle cx="38.5" cy="43" r="1" fill="var(--card)" />
      <circle cx="66.5" cy="43" r="1" fill="var(--card)" />
      {/* Nose */}
      <ellipse cx="50" cy="57" rx="4.5" ry="3" fill="var(--foreground)" opacity="0.55" />
      {/* Mouth — cute smile */}
      <path d="M 45 61 Q 50 66 55 61" stroke="var(--foreground)" strokeWidth="1.5" fill="none" opacity="0.35" strokeLinecap="round" />
      {/* Pink cheeks */}
      <circle cx="26" cy="57" r="6" fill="#F9A8C9" opacity="0.35" />
      <circle cx="74" cy="57" r="6" fill="#F9A8C9" opacity="0.35" />
    </svg>
  );
}
