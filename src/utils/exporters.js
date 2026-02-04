import { clamp, dayDiff, formatMonthLabel, parseDateUTC } from './date';

export function downloadFile({ name, mime, contents }) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildCsv({ tasks, sections, milestones }) {
  const header = [
    'Type',
    'Section',
    'Name',
    'Start',
    'End',
    'Duration (days)',
    'Color',
  ];

  const sectionNameById = new Map(sections.map((section) => [section.id, section.name]));
  const rows = [];

  sections.forEach((section) => {
    rows.push(['Section', section.name, section.name, '', '', '', section.color]);

    tasks
      .filter((task) => task.sectionId === section.id)
      .forEach((task) => {
        const startMs = parseDateUTC(task.start);
        const endMs = parseDateUTC(task.end);
        const duration =
          startMs !== null && endMs !== null ? dayDiff(startMs, endMs) + 1 : '';
        rows.push([
          'Task',
          section.name,
          task.name,
          task.start,
          task.end,
          duration,
          task.color,
        ]);
      });

    milestones
      .filter((milestone) => milestone.sectionId === section.id)
      .forEach((milestone) => {
        rows.push([
          'Milestone',
          section.name,
          milestone.name,
          milestone.date,
          milestone.date,
          1,
          milestone.color,
        ]);
      });
  });

  const unassignedTasks = tasks.filter((task) => !task.sectionId);
  const unassignedMilestones = milestones.filter((milestone) => !milestone.sectionId);
  if (unassignedTasks.length > 0 || unassignedMilestones.length > 0) {
    rows.push(['Section', 'Unassigned', 'Unassigned', '', '', '', '']);
    unassignedTasks.forEach((task) => {
      const startMs = parseDateUTC(task.start);
      const endMs = parseDateUTC(task.end);
      const duration =
        startMs !== null && endMs !== null ? dayDiff(startMs, endMs) + 1 : '';
      rows.push([
        'Task',
        'Unassigned',
        task.name,
        task.start,
        task.end,
        duration,
        task.color,
      ]);
    });
    unassignedMilestones.forEach((milestone) => {
      rows.push([
        'Milestone',
        'Unassigned',
        milestone.name,
        milestone.date,
        milestone.date,
        1,
        milestone.color,
      ]);
    });
  }
  const escapeCell = (value) => {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) {
      return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
  };
  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
}

function computeDayWidth(days, maxWidth = 1100) {
  if (days.length <= 0) return 24;
  return maxWidth / days.length;
}

function buildMonthSegments(days) {
  const segments = [];
  let cursor = 0;
  while (cursor < days.length) {
    const monthKey = days[cursor].slice(0, 7);
    let span = 1;
    for (let i = cursor + 1; i < days.length; i += 1) {
      if (days[i].slice(0, 7) !== monthKey) break;
      span += 1;
    }
    segments.push({ key: monthKey, span });
    cursor += span;
  }
  return segments;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}


export function buildExportSvg({
  projectName,
  projectSubtitle,
  days,
  rows,
  markerIndexes = [],
  offDayIndexes = [],
}) {
  const leftWidth = 260;
  const timelineWidth = 1100;
  const dayWidth = computeDayWidth(days, timelineWidth);
  const monthHeight = 26;
  const weekHeight = 28;
  const dayHeight = 48;
  const headerHeight = monthHeight + weekHeight + dayHeight;
  const rowHeight = 56;
  const sectionHeight = 28;
  const totalRowHeight = rows.reduce(
    (sum, row) => sum + (row.type === 'section' ? sectionHeight : rowHeight),
    0
  );
  const height = headerHeight + totalRowHeight + 90;
  const width = leftWidth + timelineWidth + 40;
  const range = days.length ? `${days[0]} → ${days[days.length - 1]}` : '';
  const monthSegments = buildMonthSegments(days);

  let currentX = leftWidth;
  const monthLabels = monthSegments
    .map((segment) => {
      const spanWidth = segment.span * dayWidth;
      const x = currentX + spanWidth / 2;
      currentX += spanWidth;
      return `<text x="${x}" y="${monthHeight - 8}" class="month" text-anchor="middle">${escapeXml(
        formatMonthLabel(segment.key)
      )}</text>`;
    })
    .join('');

  const weekLabels = Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => {
    const span = Math.min(7, days.length - index * 7);
    const x = leftWidth + index * 7 * dayWidth + (span * dayWidth) / 2;
    return `<text x="${x}" y="${monthHeight + weekHeight - 8}" class="week" text-anchor="middle">WEEK ${index + 1}</text>`;
  }).join('');

  const dayLabels = days
    .map((day, index) => {
      const x = leftWidth + index * dayWidth + dayWidth / 2;
      const label = day.slice(8);
      return `<text x="${x}" y="${headerHeight - 10}" class="day" text-anchor="middle">${escapeXml(
        label
      )}</text>`;
    })
    .join('');

  const gridLines = days
    .map((_, index) => {
      const x = leftWidth + index * dayWidth;
      return `<line x1="${x}" y1="${headerHeight}" x2="${x}" y2="${height - 40}" stroke="rgba(0,0,0,0.08)" />`;
    })
    .join('');

  const offSegments = offDayIndexes
    .map((dayIndex) => {
      const x = leftWidth + dayIndex * dayWidth;
      return `<rect x="${x}" y="${headerHeight}" width="${dayWidth}" height="${height - headerHeight - 40}" fill="rgba(255,183,77,0.18)" />`;
    })
    .join('');

  const markerSegments = markerIndexes
    .map((marker) => {
      const x = leftWidth + marker.dayIndex * dayWidth;
      return `<rect x="${x}" y="${headerHeight}" width="${dayWidth}" height="${height - headerHeight - 40}" fill="${marker.color}" opacity="0.12" />`;
    })
    .join('');

  const markerDots = markerIndexes
    .map((marker) => {
      const x = leftWidth + marker.dayIndex * dayWidth + dayWidth / 2;
      return `<circle cx="${x}" cy="${headerHeight - 4}" r="3" fill="${marker.color}" />`;
    })
    .join('');

  let rowCursor = headerHeight;
  const rowMarkup = rows
    .map((row) => {
      if (row.type === 'section') {
        const section = row.section;
        const y = rowCursor;
        rowCursor += sectionHeight;
        return `
          <rect x="0" y="${y}" width="${width}" height="${sectionHeight}" fill="rgba(255,227,198,0.6)" />
          <text x="24" y="${y + 18}" class="section">${escapeXml(
            section.name.toUpperCase()
          )}</text>
        `;
      }
      if (row.type === 'milestone') {
        const milestone = row.milestone;
        const dateMs = parseDateUTC(milestone.date);
        const y = rowCursor;
        rowCursor += rowHeight;
        if (dateMs === null) return '';
        const dayIndex = clamp(dayDiff(parseDateUTC(days[0]), dateMs), 0, days.length - 1);
        const x = leftWidth + dayIndex * dayWidth + dayWidth / 2;
        const size = 10;
        const symbol = milestone.symbol || 'diamond';
        let shape = '';
        if (symbol === 'circle') {
          shape = `<circle cx="${x}" cy="${y + rowHeight / 2}" r="${size / 2}" fill="${milestone.color}" />`;
        } else if (symbol === 'square') {
          shape = `<rect x="${x - size / 2}" y="${y + (rowHeight - size) / 2}" width="${size}" height="${size}" fill="${milestone.color}" />`;
        } else if (symbol === 'triangle') {
          const topY = y + (rowHeight - size) / 2;
          const bottomY = topY + size;
          shape = `<polygon points="${x},${topY} ${x - size / 2},${bottomY} ${x + size / 2},${bottomY}" fill="${milestone.color}" />`;
        } else if (symbol === 'star') {
          const r = size / 2;
          const points = [
            [0, -r],
            [0.22 * r, -0.22 * r],
            [r, -0.2 * r],
            [0.35 * r, 0.12 * r],
            [0.6 * r, r],
            [0, 0.5 * r],
            [-0.6 * r, r],
            [-0.35 * r, 0.12 * r],
            [-r, -0.2 * r],
            [-0.22 * r, -0.22 * r],
          ]
            .map(([dx, dy]) => `${x + dx},${y + rowHeight / 2 + dy}`)
            .join(' ');
          shape = `<polygon points="${points}" fill="${milestone.color}" />`;
        } else if (symbol === 'hex') {
          const r = size / 2;
          const points = [
            [0.5 * r, -r],
            [r, 0],
            [0.5 * r, r],
            [-0.5 * r, r],
            [-r, 0],
            [-0.5 * r, -r],
          ]
            .map(([dx, dy]) => `${x + dx},${y + rowHeight / 2 + dy}`)
            .join(' ');
          shape = `<polygon points="${points}" fill="${milestone.color}" />`;
        } else if (symbol === 'flag') {
          const topY = y + (rowHeight - size) / 2;
          const bottomY = topY + size;
          const leftX = x - size / 2;
          const rightX = x + size / 2;
          const midX = x + size * 0.2;
          shape = `<polygon points="${leftX},${topY} ${rightX},${topY} ${midX},${y + rowHeight / 2} ${rightX},${bottomY} ${leftX},${bottomY}" fill="${milestone.color}" />`;
        } else {
          shape = `<rect x="${x - size / 2}" y="${y + (rowHeight - size) / 2}" width="${size}" height="${size}" transform="rotate(45 ${x} ${y + rowHeight / 2})" fill="${milestone.color}" />`;
        }
        return `
          <text x="24" y="${y + 24}" class="task-name">${escapeXml(milestone.name)}</text>
          ${shape}
        `;
      }
      const task = row.task;
      const startMs = parseDateUTC(task.start);
      const endMs = parseDateUTC(task.end);
      const y = rowCursor;
      rowCursor += rowHeight;
      if (startMs === null || endMs === null) return '';
      const startIndexRaw = clamp(dayDiff(parseDateUTC(days[0]), startMs), 0, days.length - 1);
      const endIndexRaw = clamp(dayDiff(parseDateUTC(days[0]), endMs), 0, days.length - 1);
      const startIndex = Math.min(startIndexRaw, endIndexRaw);
      const endIndex = Math.max(startIndexRaw, endIndexRaw);
      const x = leftWidth + startIndex * dayWidth;
      const barWidth = (endIndex - startIndex + 1) * dayWidth;

      return `
        <text x="24" y="${y + 22}" class="task-name">${escapeXml(task.name)}</text>
        <text x="24" y="${y + 40}" class="task-date">${escapeXml(
          `${task.start} → ${task.end}`
        )}</text>
        <rect x="${x}" y="${y + 12}" width="${barWidth}" height="${rowHeight - 24}" rx="11" fill="${task.color}" />
      `;
    })
    .join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>
        text { font-family: "Space Grotesk", Arial, sans-serif; }
        .title { font-family: "Fraunces", Georgia, serif; font-size: 20px; fill: #1c1a17; }
        .subtitle { font-size: 12px; fill: #5f5a55; }
        .range { font-size: 10px; fill: #7a736b; }
        .month { font-size: 11px; fill: #5f5a55; }
        .week { font-size: 12px; fill: #5f5a55; letter-spacing: 1.6px; text-transform: uppercase; }
        .day { font-size: 11px; fill: #7a736b; }
        .section { font-size: 12px; fill: #5f5a55; letter-spacing: 1.6px; }
        .task-name { font-size: 16px; fill: #1c1a17; font-weight: 600; }
        .task-date { font-size: 12px; fill: #7a736b; }
      </style>
      <rect width="100%" height="100%" fill="#fffdf9" />
      <text x="24" y="28" class="title">${escapeXml(projectName)}</text>
      ${
        projectSubtitle
          ? `<text x="24" y="50" class="subtitle">${escapeXml(projectSubtitle)}</text>`
          : ''
      }
      <text x="24" y="66" class="range">${escapeXml(range)}</text>
      ${offSegments}
      ${markerSegments}
      ${gridLines}
      ${monthLabels}
      ${weekLabels}
      ${dayLabels}
      ${markerDots}
      ${rowMarkup}
    </svg>
  `;

  return { svg, width, height };
}

export async function downloadPng({ name, svg }) {
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  const canvas = document.createElement('canvas');
  const widthMatch = svg.match(/width="(\d+)"/);
  const heightMatch = svg.match(/height="(\d+)"/);
  const width = widthMatch ? Number(widthMatch[1]) : 1200;
  const height = heightMatch ? Number(heightMatch[1]) : 800;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  const pngUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = pngUrl;
  anchor.download = name;
  anchor.click();
}

export function openPrintWindow({
  projectName,
  projectSubtitle,
  days,
  rows,
  markerIndexes = [],
  offDayIndexes = [],
}) {
  const range = days.length ? `${days[0]} → ${days[days.length - 1]}` : '';
  const monthSegments = buildMonthSegments(days);
  const headerCells = days
    .map((day, index) => {
      const label = day.slice(8);
      const cls = index % 7 === 0 ? 'day major' : 'day';
      return `<div class="${cls}"><span>${label}</span></div>`;
    })
    .join('');

  const offMarkup = offDayIndexes
    .map((dayIndex) => {
      const left = (dayIndex / days.length) * 100;
      const width = (1 / days.length) * 100;
      return `<div class="off" style="left:${left}%;width:${width}%"></div>`;
    })
    .join('');

  const markerMarkup = markerIndexes
    .map((marker) => {
      const left = (marker.dayIndex / days.length) * 100;
      const width = (1 / days.length) * 100;
      return `<div class="marker" style="left:${left}%;width:${width}%;background:${marker.color}"></div>`;
    })
    .join('');

  const rowMarkup = rows
    .map((row) => {
      if (row.type === 'section') {
        return `
          <div class="row section">
            <div class="label section">${row.section.name}</div>
            <div class="track">${offMarkup}${markerMarkup}</div>
          </div>
        `;
      }
      if (row.type === 'milestone') {
        const dateMs = parseDateUTC(row.milestone.date);
        if (dateMs === null) return '';
        const dayIndex = clamp(dayDiff(parseDateUTC(days[0]), dateMs), 0, days.length - 1);
        const left = (dayIndex / days.length) * 100;
        const symbolClass = row.milestone.symbol || 'diamond';
        return `
          <div class="row">
            <div class="label">
              <span class="milestone-shape ${symbolClass}" style="background:${row.milestone.color}"></span>
              <div class="name">${row.milestone.name}</div>
            </div>
            <div class="track">
              ${offMarkup}
              ${markerMarkup}
              <div class="milestone ${symbolClass}" style="left:${left}%;background:${row.milestone.color}"></div>
            </div>
          </div>
        `;
      }
      const task = row.task;
      const startMs = parseDateUTC(task.start);
      const endMs = parseDateUTC(task.end);
      if (startMs === null || endMs === null) return '';
      const startIndexRaw = clamp(dayDiff(parseDateUTC(days[0]), startMs), 0, days.length - 1);
      const endIndexRaw = clamp(dayDiff(parseDateUTC(days[0]), endMs), 0, days.length - 1);
      const startIndex = Math.min(startIndexRaw, endIndexRaw);
      const endIndex = Math.max(startIndexRaw, endIndexRaw);
      const left = (startIndex / days.length) * 100;
      const width = ((endIndex - startIndex + 1) / days.length) * 100;

      return `
        <div class="row">
          <div class="label">
            <span class="dot" style="background:${task.color}"></span>
            <div>
              <div class="name">${task.name}</div>
              <div class="dates">${task.start} → ${task.end}</div>
            </div>
          </div>
          <div class="track">
            ${offMarkup}
            ${markerMarkup}
            <div class="bar" style="left:${left}%;width:${width}%;background:${task.color}">
              <span>${task.name}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${projectName} — Gantt Export</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 32px;
            font-family: "Space Grotesk", Arial, sans-serif;
            color: #1c1a17;
          }
          h1 {
            font-family: "Fraunces", Georgia, serif;
            margin: 0 0 16px;
          }
          .subtitle {
            margin: -8px 0 12px;
            color: #5f5a55;
            font-size: 14px;
          }
          .range {
            color: #7a736b;
            font-size: 12px;
            margin-bottom: 12px;
          }
          .meta { color: #5f5a55; margin-bottom: 24px; }
          .grid {
            border: 1px solid #e4dcd2;
            border-radius: 14px;
            overflow: hidden;
            width: 100%;
          }
          .header {
            display: grid;
            grid-template-columns: 260px 1fr;
            background: #fff7ee;
            border-bottom: 1px solid #e4dcd2;
          }
          .head-left {
            padding: 12px 16px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #5f5a55;
            font-weight: 600;
            border-right: 1px solid #e4dcd2;
          }
          .head-days {
            display: grid;
            grid-template-columns: repeat(var(--days), minmax(0, 1fr));
          }
          .head-weeks {
            display: grid;
            grid-template-columns: repeat(var(--days), minmax(0, 1fr));
            border-top: 1px solid #f0e7db;
            border-bottom: 1px solid #f0e7db;
          }
          .day {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #7a736b;
            border-right: 1px solid #f0e7db;
          }
          .week {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #5f5a55;
            border-right: 1px solid #f0e7db;
            text-transform: uppercase;
            letter-spacing: 0.18em;
          }
          .day.major { color: #1c1a17; font-weight: 600; }
          .row {
            display: grid;
            grid-template-columns: 260px 1fr;
            border-bottom: 1px solid #f0e7db;
            min-height: 56px;
          }
          .row.section {
            min-height: 28px;
            background: rgba(255, 227, 198, 0.6);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            font-size: 12px;
            color: #5f5a55;
          }
          .label.section {
            padding: 6px 16px;
          }
          .label {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            border-right: 1px solid #f0e7db;
            background: #fffdf9;
            font-size: 16px;
          }
          .name { font-weight: 600; font-size: 16px; }
          .dates { font-size: 12px; color: #7a736b; }
          .dot { width: 10px; height: 10px; border-radius: 999px; }
          .milestone-shape { width: 10px; height: 10px; display: inline-block; border-radius: 2px; }
          .milestone-shape.diamond { transform: rotate(45deg); }
          .milestone-shape.circle { border-radius: 999px; }
          .milestone-shape.triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
          .track {
            position: relative;
            background-image: linear-gradient(
              to right,
              rgba(0,0,0,0.06) 1px,
              transparent 1px
            );
            background-size: calc(100% / var(--days)) 100%;
          }
          .off {
            position: absolute;
            top: 0;
            bottom: 0;
            background: rgba(255, 183, 77, 0.18);
          }
          .marker {
            position: absolute;
            top: 0;
            bottom: 0;
            opacity: 0.15;
          }
          .bar {
            position: absolute;
            top: 12px;
            height: 32px;
            border-radius: 11px;
            display: flex;
            align-items: center;
            padding: 0 12px;
            color: #fff;
            font-size: 13px;
            font-weight: 600;
          }
          .milestone {
            position: absolute;
            top: 50%;
            width: 16px;
            height: 16px;
            transform: translate(-50%, -50%) rotate(45deg);
            border-radius: 3px;
          }
          .milestone.circle { transform: translate(-50%, -50%); border-radius: 50%; }
          .milestone.square { transform: translate(-50%, -50%); border-radius: 3px; }
          .milestone.triangle { transform: translate(-50%, -50%); clip-path: polygon(50% 0%, 0% 100%, 100% 100%); border-radius: 0; }
          .milestone.star { transform: translate(-50%, -50%); clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); border-radius: 0; }
          .milestone.hex { transform: translate(-50%, -50%); clip-path: polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%); border-radius: 0; }
          .milestone.flag { transform: translate(-50%, -50%); clip-path: polygon(0 0, 100% 0, 70% 50%, 100% 100%, 0 100%); border-radius: 0; }
          @media print {
            body { margin: 12mm; }
          }
          @page { size: landscape; }
        </style>
      </head>
      <body>
        <h1>${projectName}</h1>
        ${projectSubtitle ? `<div class="subtitle">${projectSubtitle}</div>` : ''}
        ${range ? `<div class="range">${range}</div>` : ''}
        <div class="grid" style="--days:${days.length}">
          <div class="header">
            <div class="head-left">Tasks</div>
            <div>
              <div class="head-days">
                ${monthSegments
                  .map(
                    (segment) =>
                      `<div class="day major" style="grid-column: span ${segment.span}">${formatMonthLabel(segment.key)}</div>`
                  )
                  .join('')}
              </div>
              <div class="head-weeks">
                ${Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => {
                  const span = Math.min(7, days.length - index * 7);
                  if (span <= 0) return '';
                  return `<div class="week" style="grid-column: span ${span}">Week ${index + 1}</div>`;
                }).join('')}
              </div>
              <div class="head-days">${headerCells}</div>
            </div>
          </div>
          ${rowMarkup}
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };
}
