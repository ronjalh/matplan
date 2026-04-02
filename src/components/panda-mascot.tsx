/**
 * Matplan panda mascot — flat, minimal design matching the app's aesthetic.
 * Uses the design system colors (sage, cream, charcoal).
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
    >
      {/* Ears */}
      <circle cx="25" cy="25" r="15" fill="var(--foreground)" opacity="0.8" />
      <circle cx="75" cy="25" r="15" fill="var(--foreground)" opacity="0.8" />
      {/* Head */}
      <circle cx="50" cy="50" r="35" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      {/* Eye patches */}
      <ellipse cx="36" cy="45" rx="10" ry="8" fill="var(--foreground)" opacity="0.8" />
      <ellipse cx="64" cy="45" rx="10" ry="8" fill="var(--foreground)" opacity="0.8" />
      {/* Eyes */}
      <circle cx="36" cy="44" r="4" fill="var(--card)" />
      <circle cx="64" cy="44" r="4" fill="var(--card)" />
      <circle cx="37" cy="43" r="1.5" fill="var(--foreground)" />
      <circle cx="65" cy="43" r="1.5" fill="var(--foreground)" />
      {/* Nose */}
      <ellipse cx="50" cy="56" rx="4" ry="3" fill="var(--foreground)" opacity="0.6" />
      {/* Mouth */}
      <path d="M 46 60 Q 50 65 54 60" stroke="var(--foreground)" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="28" cy="55" r="5" fill="var(--primary)" opacity="0.15" />
      <circle cx="72" cy="55" r="5" fill="var(--primary)" opacity="0.15" />
    </svg>
  );
}
