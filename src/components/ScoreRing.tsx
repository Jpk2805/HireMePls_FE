interface ScoreRingProps {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
}

const CONFIGS = {
  sm: { dim: 44, sw: 4, fontSize: 11 },
  md: { dim: 56, sw: 5, fontSize: 13 },
  lg: { dim: 84, sw: 7, fontSize: 20 },
}

export default function ScoreRing({ score, size = 'md' }: ScoreRingProps) {
  const { dim, sw, fontSize } = CONFIGS[size]
  const r = (dim - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const pct = score ?? 0
  const filled = (pct / 100) * circ

  const color =
    score === null
      ? '#d1d5db'
      : score >= 70
      ? '#16a34a'
      : score >= 40
      ? '#d97706'
      : '#dc2626'

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: dim, height: dim }}
    >
      <svg
        width={dim}
        height={dim}
        style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}
      >
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={sw}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <span style={{ fontSize, color, fontWeight: 700, position: 'relative' }}>
        {score ?? '—'}
      </span>
    </div>
  )
}
