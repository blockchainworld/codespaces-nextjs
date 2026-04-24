import styles from '../styles/detail.module.css'

function buildPath(points, width, height, padding) {
  const step = (width - padding * 2) / Math.max(points.length - 1, 1)

  return points
    .map((value, index) => {
      const x = padding + step * index
      const y = height - padding - (value / 100) * (height - padding * 2)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

export default function ProbabilityChart({ points }) {
  const width = 680
  const height = 260
  const padding = 28
  const path = buildPath(points, width, height, padding)
  const step = (width - padding * 2) / Math.max(points.length - 1, 1)

  return (
    <div className={styles.chartShell}>
      <div className={styles.chartMeta}>
        <div>
          <span className={styles.chartLabel}>Probability path</span>
          <strong>{points[points.length - 1]}%</strong>
        </div>
        <p>Evidence-linked repricing across the latest reporting cycle.</p>
      </div>
      <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Probability trend chart">
        {[20, 40, 60, 80].map((tick) => {
          const y = height - padding - (tick / 100) * (height - padding * 2)
          return (
            <g key={tick}>
              <line className={styles.chartGrid} x1={padding} x2={width - padding} y1={y} y2={y} />
              <text className={styles.chartTick} x={8} y={y + 4}>
                {tick}%
              </text>
            </g>
          )
        })}
        <path className={styles.chartArea} d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} />
        <path className={styles.chartLine} d={path} />
        {points.map((value, index) => {
          const x = padding + step * index
          const y = height - padding - (value / 100) * (height - padding * 2)
          return <circle className={styles.chartDot} cx={x} cy={y} key={`${value}-${index}`} r="5" />
        })}
      </svg>
      <div className={styles.chartFooter}>
        {points.map((value, index) => (
          <div className={styles.chartPoint} key={`${value}-${index}`}>
            <span>W{index + 1}</span>
            <strong>{value}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}