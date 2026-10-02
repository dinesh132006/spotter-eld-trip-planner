import React from 'react';

export default function EldSvgGrid({ svgGrid }) {
  if (!svgGrid) return null;

  // Grid dimensions: width 1440 (1 min = 1 unit), height 160 (40 units per row)
  // X offset: 180 for left row labels, Right padding: 60 for 24:00 label
  const X_OFFSET = 180;
  const GRID_WIDTH = 1440;
  const TOTAL_WIDTH = X_OFFSET + GRID_WIDTH + 60; // 1680

  const hours = Array.from({ length: 25 }, (_, i) => i);
  const rowLabels = [
    { label: 'OFF DUTY', y: 20 },
    { label: 'SLEEPER BERTH', y: 60 },
    { label: 'DRIVING', y: 100 },
    { label: 'ON DUTY (NOT DRIVING)', y: 140 },
  ];

  return (
    <div className="w-full bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 overflow-x-auto">
      <div className="min-w-[780px] relative">
        <svg
          viewBox={`0 0 ${TOTAL_WIDTH} 200`}
          className="w-full h-auto text-slate-300 font-mono select-none"
        >
          {/* Background Grid Fill */}
          <rect x={X_OFFSET} y="0" width={GRID_WIDTH} height="160" fill="#090d16" stroke="#1e293b" strokeWidth="1" />

          {/* Status Row Background Strips & Labels */}
          {rowLabels.map((row, idx) => (
            <g key={idx}>
              {/* Row Label Text (Positioned at X_OFFSET - 12 with textAnchor="end") */}
              <text
                x={X_OFFSET - 12}
                y={row.y + 4}
                textAnchor="end"
                className="fill-slate-300 font-sans font-bold text-[12px]"
              >
                {row.label}
              </text>
              {/* Horizontal Row Divider */}
              <line
                x1={X_OFFSET}
                y1={row.y + 20}
                x2={X_OFFSET + GRID_WIDTH}
                y2={row.y + 20}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </g>
          ))}

          {/* Vertical Hour Grid Lines & Labels */}
          {hours.map((hr) => {
            const x = X_OFFSET + hr * 60;
            return (
              <g key={hr}>
                {/* Major Hour Line */}
                <line
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="160"
                  stroke={hr === 0 || hr === 24 ? '#475569' : '#1e293b'}
                  strokeWidth={hr === 0 || hr === 24 ? '2' : '1'}
                />

                {/* 30-Minute Sub-Tick Line */}
                {hr < 24 && (
                  <line
                    x1={x + 30}
                    y1="0"
                    x2={x + 30}
                    y2="160"
                    stroke="#0f172a"
                    strokeWidth="1"
                    strokeDasharray="1,3"
                  />
                )}

                {/* Hour Header Label (00..24) */}
                <text
                  x={x}
                  y="184"
                  textAnchor="middle"
                  className="fill-slate-400 font-mono font-semibold text-[11px]"
                >
                  {hr.toString().padStart(2, '0')}
                </text>
              </g>
            );
          })}

          {/* Dynamic Duty Status Polyline */}
          <g transform={`translate(${X_OFFSET}, 0)`}>
            <path
              d={svgGrid.path_d}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              className="drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
            />
          </g>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 px-3">
          <span>MIDNIGHT (00:00)</span>
          <span>NOON (12:00)</span>
          <span>MIDNIGHT (24:00)</span>
        </div>
      </div>
    </div>
  );
}
