"use client";

import type { PlateModelScore } from "@/lib/nutrition/plate-model";
import { getPlateModelLabel } from "@/lib/nutrition/plate-model";

interface PlateModelVisualProps {
  score: PlateModelScore;
  size?: number;
}

/**
 * SVG donut chart showing the plate model (tallerkensmodellen).
 * Three segments: vegetables (green), carbs (warm), protein (terracotta).
 */
export function PlateModelVisual({ score, size = 160 }: PlateModelVisualProps) {
  const center = size / 2;
  const radius = size / 2 - 8;
  const innerRadius = radius * 0.55;

  const segments = [
    { value: score.vegetable, color: "var(--color-success)", label: "Grønt" },
    { value: score.carbohydrate, color: "var(--color-warning)", label: "Karbo" },
    { value: score.protein, color: "var(--color-terracotta)", label: "Protein" },
  ];

  // Build SVG arc paths
  let currentAngle = -90; // Start at top
  const paths = segments.map((seg) => {
    const angle = seg.value * 360;
    const path = describeArc(center, center, radius, innerRadius, currentAngle, currentAngle + angle);
    currentAngle += angle;
    return { ...seg, path };
  });

  const isEmpty = score.vegetable === 0 && score.carbohydrate === 0 && score.protein === 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Tallerkensmodell: ${Math.round(score.vegetable * 100)}% grønnsaker, ${Math.round(score.carbohydrate * 100)}% karbohydrater, ${Math.round(score.protein * 100)}% protein. ${getPlateModelLabel(score.assessment)}`}
      >
        <title>Tallerkensmodell</title>
        {isEmpty ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={radius - innerRadius}
            opacity={0.3}
          />
        ) : (
          paths.map((seg, i) =>
            seg.value > 0 ? (
              <path key={i} d={seg.path} fill={seg.color} opacity={0.85} />
            ) : null
          )
        )}
        {/* Center text */}
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          className="text-xs fill-foreground font-medium"
        >
          {isEmpty ? "—" : getPlateModelLabel(score.assessment)}
        </text>
        {!isEmpty && (
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={10}
          >
            {Math.round(score.vegetable * 100)}/{Math.round(score.carbohydrate * 100)}/{Math.round(score.protein * 100)}
          </text>
        )}
      </svg>
      {/* Legend */}
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-success)" }} />
          Grønt
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-warning)" }} />
          Karbo
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-terracotta)" }} />
          Protein
        </span>
      </div>
    </div>
  );
}

/** Create an SVG arc path for a donut segment */
function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  // Clamp to avoid full circle issues
  const sweep = Math.min(endAngle - startAngle, 359.99);
  const endAdj = startAngle + sweep;

  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAdj);
  const innerStart = polarToCartesian(cx, cy, innerR, endAdj);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArc = sweep > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}
