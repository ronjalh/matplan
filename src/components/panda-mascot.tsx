/**
 * Matplan panda mascot — kawaii style, round face, big eye patches, pink cheeks.
 */
export function PandaMascot({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Matplan-pandaen"
      className="inline-block"
    >
      {/* Ears */}
      <circle cx="25" cy="18" r="17" fill="#3D3028" />
      <circle cx="95" cy="18" r="17" fill="#3D3028" />
      <circle cx="25" cy="18" r="9" fill="#5C4A3D" />
      <circle cx="95" cy="18" r="9" fill="#5C4A3D" />

      {/* Head — wider, rounder */}
      <ellipse cx="60" cy="50" rx="46" ry="36" fill="#FFF9F5" stroke="#3D3028" strokeWidth="2.5" />

      {/* Eye patches — bigger, more panda-like */}
      <ellipse cx="38" cy="46" rx="16" ry="13" fill="#3D3028" transform="rotate(-8 38 46)" />
      <ellipse cx="82" cy="46" rx="16" ry="13" fill="#3D3028" transform="rotate(8 82 46)" />

      {/* Eyes — big kawaii */}
      <circle cx="38" cy="45" r="8.5" fill="#FFFDF8" />
      <circle cx="82" cy="45" r="8.5" fill="#FFFDF8" />
      {/* Iris */}
      <circle cx="40" cy="45" r="6" fill="#3D3028" />
      <circle cx="84" cy="45" r="6" fill="#3D3028" />
      {/* Eye shine — large */}
      <circle cx="43" cy="43" r="2.8" fill="#FFFDF8" />
      <circle cx="87" cy="43" r="2.8" fill="#FFFDF8" />
      {/* Eye shine — small */}
      <circle cx="38" cy="47" r="1.2" fill="#FFFDF8" />
      <circle cx="82" cy="47" r="1.2" fill="#FFFDF8" />

      {/* Nose */}
      <ellipse cx="60" cy="58" rx="4.5" ry="3" fill="#3D3028" />

      {/* Mouth */}
      <path d="M 55 62 Q 60 67 65 62" stroke="#3D3028" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Pink cheeks */}
      <circle cx="24" cy="56" r="8" fill="#FFB6C8" opacity="0.35" />
      <circle cx="96" cy="56" r="8" fill="#FFB6C8" opacity="0.35" />

      {/* Paws peeking from bottom */}
      <ellipse cx="36" cy="86" rx="15" ry="10" fill="#3D3028" />
      <ellipse cx="84" cy="86" rx="15" ry="10" fill="#3D3028" />
      {/* Paw pads */}
      <circle cx="31" cy="84" r="2.5" fill="#5C4A3D" />
      <circle cx="36" cy="82" r="2.5" fill="#5C4A3D" />
      <circle cx="41" cy="84" r="2.5" fill="#5C4A3D" />
      <circle cx="79" cy="84" r="2.5" fill="#5C4A3D" />
      <circle cx="84" cy="82" r="2.5" fill="#5C4A3D" />
      <circle cx="89" cy="84" r="2.5" fill="#5C4A3D" />
    </svg>
  );
}
