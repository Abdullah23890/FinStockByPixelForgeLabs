export default function TrendLineChart({ data = [], series = [], height = 220 }) {
  if (!data.length) return <p style={{ color: "#8C97B5", fontSize: 13 }}>No data available.</p>;

  const width = 640;
  const padding = { top: 16, right: 16, bottom: 30, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allValues = data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0));
  const maxVal = Math.max(...allValues, 1);
  const stepX = chartW / (data.length - 1 || 1);

  function pointsFor(key) {
    return data.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (Number(d[key]) / maxVal) * chartH;
      return [x, y];
    });
  }

  function pathFor(key) {
    const pts = pointsFor(key);
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ");
  }

  function areaFor(key) {
    const pts = pointsFor(key);
    const first = pts[0];
    const last = pts[pts.length - 1];
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ");
    return `${line} L ${last[0]},${padding.top + chartH} L ${first[0]},${padding.top + chartH} Z`;
  }

  const gridLines = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      {/* Gridlines */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = padding.top + (chartH / gridLines) * i;
        const val = Math.round(maxVal - (maxVal / gridLines) * i);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#EFF1F7" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#8C97B5">
              {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
            </text>
          </g>
        );
      })}

      {/* Areas + lines per series */}
      {series.map((s) => (
        <g key={s.key}>
          <defs>
            <linearGradient id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaFor(s.key)} fill={`url(#grad-${s.key})`} />
          <path d={pathFor(s.key)} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          {pointsFor(s.key).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={s.color} strokeWidth="2" />
          ))}
        </g>
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={padding.left + i * stepX}
          y={height - 8}
          textAnchor="middle"
          fontSize="9.5"
          fill="#6B7590"
        >
          {d.month}
        </text>
      ))}
    </svg>
  );
}