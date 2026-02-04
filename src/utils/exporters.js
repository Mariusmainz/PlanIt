import { clamp, dayDiff, parseDateUTC } from './date';

export function downloadFile({ name, mime, contents }) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildCsv(tasks) {
  const header = ['Task', 'Start', 'End', 'Color'];
  const rows = tasks.map((task) => [task.name, task.start, task.end, task.color]);
  const escapeCell = (value) => {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) {
      return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
  };
  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
}

export function openPrintWindow({ projectName, projectSubtitle, days, tasks }) {
  const headerCells = days
    .map((day, index) => {
      const label = day.slice(5);
      const cls = index % 7 === 0 ? 'day major' : 'day';
      return `<div class="${cls}"><span>${label}</span></div>`;
    })
    .join('');

  const rows = tasks
    .map((task) => {
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
          .meta { color: #5f5a55; margin-bottom: 24px; }
          .grid {
            border: 1px solid #e4dcd2;
            border-radius: 14px;
            overflow: hidden;
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
            grid-template-columns: repeat(${days.length}, minmax(20px, 1fr));
          }
          .day {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #7a736b;
            border-right: 1px solid #f0e7db;
          }
          .day.major { color: #1c1a17; font-weight: 600; }
          .row {
            display: grid;
            grid-template-columns: 260px 1fr;
            border-bottom: 1px solid #f0e7db;
            min-height: 54px;
          }
          .label {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            border-right: 1px solid #f0e7db;
            background: #fffdf9;
          }
          .name { font-weight: 600; }
          .dates { font-size: 11px; color: #7a736b; }
          .dot { width: 10px; height: 10px; border-radius: 999px; }
          .track {
            position: relative;
            background-image: linear-gradient(
              to right,
              rgba(0,0,0,0.06) 1px,
              transparent 1px
            );
            background-size: calc(100% / ${days.length}) 100%;
          }
          .bar {
            position: absolute;
            top: 12px;
            height: 30px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            padding: 0 12px;
            color: #fff;
            font-size: 12px;
            font-weight: 600;
          }
          @media print {
            body { margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <h1>${projectName}</h1>
        ${projectSubtitle ? `<div class="subtitle">${projectSubtitle}</div>` : ''}
        <div class="meta">Gantt export • ${new Date().toLocaleString()}</div>
        <div class="grid">
          <div class="header">
            <div class="head-left">Tasks</div>
            <div class="head-days">${headerCells}</div>
          </div>
          ${rows}
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
