/**
 * Matplan panda mascot — kawaii style with big eyes, visible paws, soft outline.
 * Inspired by cute rounded panda with brown accents and pink cheeks.
 */
export function PandaMascot({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Matplan-pandaen"
      className="inline-block"
    >
      {/* Ears */}
      <circle cx="28" cy="22" r="16" fill="#3D3028" />
      <circle cx="92" cy="22" r="16" fill="#3D3028" />
      <circle cx="28" cy="22" r="9" fill="#5C4A3D" />
      <circle cx="92" cy="22" r="9" fill="#5C4A3D" />

      {/* Head */}
      <ellipse cx="60" cy="52" rx="42" ry="38" fill="#FFF9F5" stroke="#3D3028" strokeWidth="2.5" />

      {/* Eye patches */}
      <ellipse cx="40" cy="48" rx="13" ry="11" fill="#3D3028" transform="rotate(-5 40 48)" />
      <ellipse cx="80" cy="48" rx="13" ry="11" fill="#3D3028" transform="rotate(5 80 48)" />

      {/* Eyes — big kawaii style */}
      <circle cx="40" cy="47" r="8" fill="#FFFDF8" />
      <circle cx="80" cy="47" r="8" fill="#FFFDF8" />
      {/* Iris */}
      <circle cx="42" cy="47" r="5.5" fill="#3D3028" />
      <circle cx="82" cy="47" r="5.5" fill="#3D3028" />
      {/* Eye shine — large */}
      <circle cx="44" cy="45" r="2.5" fill="#FFFDF8" />
      <circle cx="84" cy="45" r="2.5" fill="#FFFDF8" />
      {/* Eye shine — small */}
      <circle cx="40" cy="49" r="1" fill="#FFFDF8" />
      <circle cx="80" cy="49" r="1" fill="#FFFDF8" />

      {/* Nose */}
      <ellipse cx="60" cy="60" rx="4" ry="2.8" fill="#3D3028" />

      {/* Mouth */}
      <path d="M 56 63 Q 60 67 64 63" stroke="#3D3028" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Pink cheeks */}
      <circle cx="28" cy="58" r="7" fill="#FFB6C8" opacity="0.4" />
      <circle cx="92" cy="58" r="7" fill="#FFB6C8" opacity="0.4" />

      {/* Paws peeking from bottom */}
      <ellipse cx="38" cy="90" rx="14" ry="10" fill="#3D3028" />
      <ellipse cx="82" cy="90" rx="14" ry="10" fill="#3D3028" />
      {/* Paw pads */}
      <circle cx="33" cy="88" r="2.5" fill="#5C4A3D" />
      <circle cx="38" cy="86" r="2.5" fill="#5C4A3D" />
      <circle cx="43" cy="88" r="2.5" fill="#5C4A3D" />
      <circle cx="77" cy="88" r="2.5" fill="#5C4A3D" />
      <circle cx="82" cy="86" r="2.5" fill="#5C4A3D" />
      <circle cx="87" cy="88" r="2.5" fill="#5C4A3D" />
    </svg>
  );
}
