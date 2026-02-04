import React, { useEffect, useMemo, useRef, useState } from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateUTC(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
}

function formatDateUTC(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function formatMonthDay(isoDate) {
  const ms = parseDateUTC(isoDate);
  if (ms === null) return isoDate;
  return new Date(ms).toLocaleString('en-US', { month: 'short', day: '2-digit' });
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dayDiff(startMs, endMs) {
  return Math.round((endMs - startMs) / DAY_MS);
}

const initialTasks = [
  {
    id: 't1',
    name: 'Discovery & Goals',
    start: '2026-02-05',
    end: '2026-02-08',
    color: '#f4b740',
    description: 'Align on scope, define research questions, and clarify deliverables.',
    sectionId: 's1',
  },
  {
    id: 't2',
    name: 'Design System',
    start: '2026-02-07',
    end: '2026-02-13',
    color: '#61c0bf',
    description: 'Create visual language, templates, and key document layouts.',
    sectionId: 's2',
  },
  {
    id: 't3',
    name: 'Core Build',
    start: '2026-02-10',
    end: '2026-02-21',
    color: '#61c0bf',
    description: 'Execute the primary work, experiments, and writing sprints.',
    sectionId: 's2',
  },
  {
    id: 't4',
    name: 'Review & QA',
    start: '2026-02-18',
    end: '2026-02-24',
    color: '#b07cf7',
    description: 'Edit, validate, and prep for final submission.',
    sectionId: 's3',
  },
];

const initialSections = [
  { id: 's1', name: 'Research', color: '#f4b740' },
  { id: 's2', name: 'Writing', color: '#61c0bf' },
  { id: 's3', name: 'Review', color: '#b07cf7' },
];

const initialMilestones = [
  {
    id: 'm1',
    name: 'Thesis Proposal Due',
    date: '2026-02-14',
    color: '#f78883',
    sectionId: 's1',
  },
];

const palette = ['#f4b740', '#61c0bf', '#5b8def', '#f78883', '#b07cf7', '#87c38f'];

function downloadFile({ name, mime, contents }) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildCsv(tasks) {
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

function openPrintWindow({ projectName, days, tasks }) {
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

export default function App() {
  const [projectName, setProjectName] = useState('PlanIt');
  const [tasks, setTasks] = useState(initialTasks);
  const [sections, setSections] = useState(initialSections);
  const [selectedId, setSelectedId] = useState(null);
  const [paddingDays, setPaddingDays] = useState(3);
  const [exportFormat, setExportFormat] = useState('json');
  const [viewMode, setViewMode] = useState('day');
  const [projectDescription, setProjectDescription] = useState(
    'Outline the thesis objectives, methodology, and expected outcomes.'
  );
  const [projectNotes, setProjectNotes] = useState(
    'Keep track of advisor feedback, key sources, and checkpoints.'
  );
  const [offDays, setOffDays] = useState(['2026-02-09', '2026-02-16']);
  const [offWeekdays, setOffWeekdays] = useState([6]);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [newMilestone, setNewMilestone] = useState(() => ({
    name: 'New milestone',
    date: formatDateUTC(Date.now()),
    sectionId: initialSections[0]?.id ?? '',
  }));
  const [markers, setMarkers] = useState([]);
  const [newMarker, setNewMarker] = useState(() => ({
    label: '',
    date: formatDateUTC(Date.now()),
    color: palette[2],
  }));

  const [newTask, setNewTask] = useState(() => {
    const today = formatDateUTC(Date.now());
    return {
      name: 'New task',
      start: today,
      end: today,
      description: '',
      sectionId: initialSections[0]?.id ?? '',
    };
  });
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionColor, setNewSectionColor] = useState(palette[0]);
  const [newOffDay, setNewOffDay] = useState(formatDateUTC(Date.now()));
  const [controlTab, setControlTab] = useState('tasks');

  const timelineRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const dragState = useRef(null);

  const { rangeStartMs, rangeEndMs, days } = useMemo(() => {
    const todayMs = parseDateUTC(formatDateUTC(Date.now()));
    let minMs = todayMs;
    let maxMs = todayMs + 13 * DAY_MS;

    if (tasks.length > 0) {
      const taskStarts = tasks.map((task) => parseDateUTC(task.start)).filter(Boolean);
      const taskEnds = tasks.map((task) => parseDateUTC(task.end)).filter(Boolean);
      minMs = Math.min(...taskStarts);
      maxMs = Math.max(...taskEnds);
    }

    if (milestones.length > 0) {
      const msDates = milestones.map((m) => parseDateUTC(m.date)).filter(Boolean);
      if (msDates.length > 0) {
        minMs = Math.min(minMs, ...msDates);
        maxMs = Math.max(maxMs, ...msDates);
      }
    }

    const paddedStart = minMs - paddingDays * DAY_MS;
    const paddedEnd = maxMs + paddingDays * DAY_MS;
    const totalDays = Math.max(1, dayDiff(paddedStart, paddedEnd) + 1);
    const timelineDays = Array.from({ length: totalDays }, (_, index) =>
      formatDateUTC(paddedStart + index * DAY_MS)
    );

    return {
      rangeStartMs: paddedStart,
      rangeEndMs: paddedEnd,
      days: timelineDays,
    };
  }, [tasks, milestones, paddingDays]);

  const timelineSegments = useMemo(() => {
    if (viewMode === 'day') {
      return days.map((day, index) => ({
        id: day,
        label: day.slice(8),
        span: 1,
        major: index % 7 === 0,
      }));
    }

    if (viewMode === 'week') {
      const segments = [];
      for (let index = 0; index < days.length; index += 7) {
        segments.push({
          id: `week-${index}`,
          label: formatMonthDay(days[index]),
          span: Math.min(7, days.length - index),
          major: true,
        });
      }
      return segments;
    }

    const segments = [];
    let cursor = 0;
    while (cursor < days.length) {
      const monthKey = days[cursor].slice(0, 7);
      let span = 1;
      for (let i = cursor + 1; i < days.length; i += 1) {
        if (days[i].slice(0, 7) !== monthKey) break;
        span += 1;
      }
      segments.push({
        id: `month-${monthKey}-${cursor}`,
        label: formatMonthLabel(monthKey),
        span,
        major: true,
      });
      cursor += span;
    }
    return segments;
  }, [days, viewMode]);

  const headerSegments = useMemo(() => {
    if (viewMode === 'day') {
      return days.map((day, index) => ({
        id: `day-${day}`,
        label: day.slice(8),
        major: index % 7 === 0,
      }));
    }
    if (viewMode === 'week') {
      const segments = [];
      for (let index = 0; index < days.length; index += 7) {
        segments.push({
          id: `week-header-${index}`,
          label: formatMonthDay(days[index]),
          major: true,
        });
      }
      return segments;
    }
    return timelineSegments.map((segment, index) => ({
      id: `month-header-${segment.id}`,
      label: segment.label,
      major: index === 0 || segment.label !== timelineSegments[index - 1]?.label,
    }));
  }, [days, timelineSegments, viewMode]);

  const dayToSegment = useMemo(() => {
    const map = [];
    let dayIndex = 0;
    timelineSegments.forEach((segment, segmentIndex) => {
      for (let i = 0; i < segment.span && dayIndex < days.length; i += 1) {
        map[dayIndex] = segmentIndex;
        dayIndex += 1;
      }
    });
    return map;
  }, [timelineSegments, days.length]);

  const offDayIndexes = useMemo(() => {
    const indexes = [];
    days.forEach((day, dayIndex) => {
      const date = new Date(parseDateUTC(day));
      const weekday = date.getUTCDay();
      const isRecurringOff = offWeekdays.includes(weekday);
      const isSpecificOff = offDays.includes(day);
      if (!isRecurringOff && !isSpecificOff) return;
      indexes.push(dayIndex);
    });
    return indexes;
  }, [offDays, offWeekdays, days]);

  const monthSegments = useMemo(() => {
    const segments = [];
    let cursor = 0;
    while (cursor < days.length) {
      const monthKey = days[cursor].slice(0, 7);
      let span = 1;
      for (let i = cursor + 1; i < days.length; i += 1) {
        if (days[i].slice(0, 7) !== monthKey) break;
        span += 1;
      }
      segments.push({
        id: `month-${monthKey}-${cursor}`,
        label: formatMonthLabel(monthKey),
        span,
      });
      cursor += span;
    }
    return segments;
  }, [days]);

  useEffect(() => {
    if (selectedId && !tasks.find((task) => task.id === selectedId)) {
      setSelectedId(null);
    }
    if (selectedMilestoneId && !milestones.find((m) => m.id === selectedMilestoneId)) {
      setSelectedMilestoneId(null);
    }
  }, [tasks, milestones, selectedId, selectedMilestoneId]);

  useEffect(() => {
    const updateWidth = () => {
      if (!timelineRef.current) return;
      setTimelineWidth(timelineRef.current.clientWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [days.length]);

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragState.current) return;
      if (!timelineWidth || days.length === 0) return;

      const dayWidth = timelineWidth / days.length;
      const deltaDays = Math.round((event.clientX - dragState.current.initialX) / dayWidth);

      if (deltaDays === dragState.current.lastDelta) return;
      dragState.current.lastDelta = deltaDays;

      const { id, mode, startIndex, endIndex } = dragState.current;
      const duration = endIndex - startIndex;
      let nextStart = startIndex;
      let nextEnd = endIndex;

      if (mode === 'move') {
        nextStart = clamp(startIndex + deltaDays, 0, days.length - 1 - duration);
        nextEnd = nextStart + duration;
      } else if (mode === 'resize-left') {
        nextStart = clamp(startIndex + deltaDays, 0, endIndex);
      } else if (mode === 'resize-right') {
        nextEnd = clamp(endIndex + deltaDays, startIndex, days.length - 1);
      }

      const updatedStart = formatDateUTC(rangeStartMs + nextStart * DAY_MS);
      const updatedEnd = formatDateUTC(rangeStartMs + nextEnd * DAY_MS);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, start: updatedStart, end: updatedEnd } : task
        )
      );
    };

    const handleUp = () => {
      dragState.current = null;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [days.length, rangeStartMs, timelineWidth]);

  const addTask = () => {
    const startMs = parseDateUTC(newTask.start);
    const endMs = parseDateUTC(newTask.end);
    if (!startMs || !endMs) return;
    const [safeStart, safeEnd] = startMs <= endMs ? [startMs, endMs] : [endMs, startMs];

    const id = `t-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const task = {
      id,
      name: newTask.name.trim() || 'Untitled task',
      start: formatDateUTC(safeStart),
      end: formatDateUTC(safeEnd),
      color: sections.find(s => s.id === (newTask.sectionId || sections[0]?.id))?.color || palette[0],
      description: newTask.description.trim(),
      sectionId: newTask.sectionId || sections[0]?.id || '',
    };
    setTasks((prev) => [...prev, task]);
    selectTask(id);
  };

  const addSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    const id = `s-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    setSections((prev) => [...prev, { id, name, color: newSectionColor }]);
    setNewSectionName('');
    const usedIndex = palette.indexOf(newSectionColor);
    setNewSectionColor(palette[(usedIndex + 1) % palette.length]);
    setNewTask((prev) => ({ ...prev, sectionId: id }));
  };

  const addOffDay = () => {
    if (!newOffDay) return;
    setOffDays((prev) => (prev.includes(newOffDay) ? prev : [...prev, newOffDay]));
  };

  const removeOffDay = (day) => {
    setOffDays((prev) => prev.filter((entry) => entry !== day));
  };

  const updateTask = (id, patch) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  };

  const selectTask = (id) => {
    setSelectedId(id);
    setSelectedMilestoneId(null);
  };

  const selectMilestone = (id) => {
    setSelectedMilestoneId(id);
    setSelectedId(null);
  };

  const addMilestone = () => {
    const dateMs = parseDateUTC(newMilestone.date);
    if (!dateMs) return;
    const id = `m-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const sectionId = newMilestone.sectionId || sections[0]?.id || '';
    const milestone = {
      id,
      name: newMilestone.name.trim() || 'Untitled milestone',
      date: formatDateUTC(dateMs),
      color: sections.find((s) => s.id === sectionId)?.color || palette[0],
      sectionId,
    };
    setMilestones((prev) => [...prev, milestone]);
    selectMilestone(id);
  };

  const updateMilestone = (id, patch) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addMarker = () => {
    const dateMs = parseDateUTC(newMarker.date);
    if (!dateMs) return;
    const label = newMarker.label.trim();
    if (!label) return;
    const id = `mk-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    setMarkers((prev) => [...prev, { id, label, date: newMarker.date, color: newMarker.color }]);
  };

  const removeMarker = (id) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  };

  const selectedTask = tasks.find((task) => task.id === selectedId);
  const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
  const sectionsWithTasks = useMemo(() => {
    const list = sections.map((section) => ({
      ...section,
      tasks: tasks.filter((task) => task.sectionId === section.id),
      milestones: milestones.filter((m) => m.sectionId === section.id),
    }));
    const unassignedTasks = tasks.filter((task) => !task.sectionId);
    const unassignedMilestones = milestones.filter((m) => !m.sectionId);
    if (unassignedTasks.length > 0 || unassignedMilestones.length > 0) {
      list.push({
        id: 'unassigned',
        name: 'Unassigned',
        tasks: unassignedTasks,
        milestones: unassignedMilestones,
      });
    }
    return list;
  }, [sections, tasks, milestones]);

  const markerIndexes = useMemo(() => {
    return markers
      .map((marker) => {
        const dateMs = parseDateUTC(marker.date);
        if (dateMs === null) return null;
        const dayIndex = dayDiff(rangeStartMs, dateMs);
        if (dayIndex < 0 || dayIndex >= days.length) return null;
        return { ...marker, dayIndex };
      })
      .filter(Boolean);
  }, [markers, rangeStartMs, days.length]);

  const handleBarPointerDown = (event, task, mode) => {
    event.preventDefault();
    event.stopPropagation();

    const startMs = parseDateUTC(task.start);
    const endMs = parseDateUTC(task.end);
    if (startMs === null || endMs === null) return;

    const startIndexRaw = clamp(dayDiff(rangeStartMs, startMs), 0, days.length - 1);
    const endIndexRaw = clamp(dayDiff(rangeStartMs, endMs), 0, days.length - 1);
    const startIndex = Math.min(startIndexRaw, endIndexRaw);
    const endIndex = Math.max(startIndexRaw, endIndexRaw);

    dragState.current = {
      id: task.id,
      mode,
      startIndex,
      endIndex,
      initialX: event.clientX,
      lastDelta: 0,
    };

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleExport = () => {
    if (tasks.length === 0) return;
    const baseName = projectName.trim().replace(/\s+/g, '-').toLowerCase() || 'project-plan';
    if (exportFormat === 'json') {
      const payload = { project: projectName, exportedAt: new Date().toISOString(), tasks, milestones, markers };
      downloadFile({
        name: `${baseName}.json`,
        mime: 'application/json',
        contents: JSON.stringify(payload, null, 2),
      });
      return;
    }
    if (exportFormat === 'csv') {
      downloadFile({
        name: `${baseName}.csv`,
        mime: 'text/csv',
        contents: buildCsv(tasks),
      });
      return;
    }
    if (exportFormat === 'tsv') {
      const header = ['Task', 'Start', 'End', 'Color'];
      const rows = tasks.map((task) => [task.name, task.start, task.end, task.color]);
      const payload = [header, ...rows].map((row) => row.join('\t')).join('\n');
      downloadFile({
        name: `${baseName}.tsv`,
        mime: 'text/tab-separated-values',
        contents: payload,
      });
    }
    if (exportFormat === 'pdf') {
      openPrintWindow({ projectName, days, tasks });
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Project Plan Studio</p>
          <h1>Shape your roadmap with a tactile Gantt editor.</h1>
          <p className="sub">
            Drag to move, stretch to resize, and keep your plan clean with automatic formatting.
          </p>
          <div className="export-row">
            <div className="view-toggle">
              <span>View</span>
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={viewMode === mode ? 'chip active' : 'chip'}
                  onClick={() => setViewMode(mode)}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <label>
              Export format
              <select
                value={exportFormat}
                onChange={(event) => setExportFormat(event.target.value)}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="tsv">TSV</option>
                <option value="pdf">PDF (print)</option>
              </select>
            </label>
            <button className="primary" type="button" onClick={handleExport}>
              Export
            </button>
          </div>
        </div>
        <div className="project-card">
          <label>
            Project title
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </label>
          <label>
            Timeline padding (days)
            <input
              type="number"
              min="0"
              max="30"
              value={paddingDays}
              onChange={(event) => setPaddingDays(Number(event.target.value) || 0)}
            />
          </label>
          <div className="project-meta">
            <div>
              <span>Tasks</span>
              <strong>{tasks.length}</strong>
            </div>
            <div>
              <span>Milestones</span>
              <strong>{milestones.length}</strong>
            </div>
            <div>
              <span>Window</span>
              <strong>
                {days[0]} → {days[days.length - 1]}
              </strong>
            </div>
          </div>
          <label>
            Description
            <textarea
              rows="3"
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
              placeholder="Describe the project goals, scope, and success criteria."
            />
          </label>
          <label>
            Notes
            <textarea
              rows="3"
              value={projectNotes}
              onChange={(event) => setProjectNotes(event.target.value)}
              placeholder="Capture feedback, sources, or next steps."
            />
          </label>
        </div>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>{projectName}</h2>
          <p>Plan, describe, and document your project in one workspace.</p>
        </div>
          <div className="toolbar-tabs">
            {[['tasks', 'Tasks'], ['milestones', 'Milestones'], ['sections', 'Sections'], ['schedule', 'Schedule']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={controlTab === key ? 'chip active' : 'chip'}
                onClick={() => setControlTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {controlTab === 'tasks' && (
            <div className="controls">
              <div className="control">
                <label>Task name</label>
                <input
                  value={newTask.name}
                  onChange={(event) =>
                    setNewTask((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Design sprint"
                />
              </div>
              <div className="control">
                <label>Start</label>
                <input
                  type="date"
                  value={newTask.start}
                  onChange={(event) =>
                    setNewTask((prev) => ({ ...prev, start: event.target.value }))
                  }
                />
              </div>
              <div className="control">
                <label>End</label>
                <input
                  type="date"
                  value={newTask.end}
                  onChange={(event) =>
                    setNewTask((prev) => ({ ...prev, end: event.target.value }))
                  }
                />
              </div>
              <div className="control">
                <label>Section</label>
                <select
                  value={newTask.sectionId}
                  onChange={(event) =>
                    setNewTask((prev) => ({ ...prev, sectionId: event.target.value }))
                  }
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="primary" type="button" onClick={addTask}>
                Add task
              </button>
            </div>
          )}

          {controlTab === 'milestones' && (
            <div className="controls milestone-controls">
              <div className="control">
                <label>Milestone name</label>
                <input
                  value={newMilestone.name}
                  onChange={(event) =>
                    setNewMilestone((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Deadline"
                />
              </div>
              <div className="control">
                <label>Date</label>
                <input
                  type="date"
                  value={newMilestone.date}
                  onChange={(event) =>
                    setNewMilestone((prev) => ({ ...prev, date: event.target.value }))
                  }
                />
              </div>
              <div className="control">
                <label>Section</label>
                <select
                  value={newMilestone.sectionId}
                  onChange={(event) =>
                    setNewMilestone((prev) => ({ ...prev, sectionId: event.target.value }))
                  }
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="primary" type="button" onClick={addMilestone}>
                Add milestone
              </button>
            </div>
          )}

          {controlTab === 'sections' && (
            <div className="section-controls">
              <label>
                Add section
                <input
                  value={newSectionName}
                  onChange={(event) => setNewSectionName(event.target.value)}
                  placeholder="Research"
                />
              </label>
              <div className="swatches">
                {palette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={newSectionColor === color ? 'swatch active' : 'swatch'}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewSectionColor(color)}
                  />
                ))}
              </div>
              <button className="ghost" type="button" onClick={addSection}>
                Add section
              </button>
            </div>
          )}

          {controlTab === 'schedule' && (
            <>
              <div className="section-controls">
                <label>
                  Off day
                  <input
                    type="date"
                    value={newOffDay}
                    onChange={(event) => setNewOffDay(event.target.value)}
                  />
                </label>
                <button className="ghost" type="button" onClick={addOffDay}>
                  Mark off day
                </button>
              </div>
              <div className="weekday-toggle">
                <span>Recurring off days</span>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={offWeekdays.includes(index) ? 'chip active' : 'chip'}
                    onClick={() =>
                      setOffWeekdays((prev) =>
                        prev.includes(index)
                          ? prev.filter((day) => day !== index)
                          : [...prev, index]
                      )
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              {offDays.length > 0 && (
                <div className="offday-list">
                  {offDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className="chip"
                      onClick={() => removeOffDay(day)}
                    >
                      {day} ×
                    </button>
                  ))}
                </div>
              )}
              <h3 className="schedule-subhead">Day markers</h3>
              <div className="section-controls">
                <label>
                  Label
                  <input
                    value={newMarker.label}
                    onChange={(event) =>
                      setNewMarker((prev) => ({ ...prev, label: event.target.value }))
                    }
                    placeholder="Project deadline"
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={newMarker.date}
                    onChange={(event) =>
                      setNewMarker((prev) => ({ ...prev, date: event.target.value }))
                    }
                  />
                </label>
                <div className="swatches">
                  {palette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={newMarker.color === color ? 'swatch active' : 'swatch'}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewMarker((prev) => ({ ...prev, color }))}
                    />
                  ))}
                </div>
                <button className="ghost" type="button" onClick={addMarker}>
                  Add marker
                </button>
              </div>
              {markers.length > 0 && (
                <div className="marker-list">
                  {markers.map((marker) => (
                    <button
                      key={marker.id}
                      type="button"
                      className="chip marker-chip"
                      onClick={() => removeMarker(marker.id)}
                    >
                      <span
                        className="marker-dot"
                        style={{ backgroundColor: marker.color }}
                      />
                      {marker.label} ({marker.date}) ×
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

            <div className="gantt">
              <div className="gantt-left">
                <div className="gantt-header">Tasks</div>
                {tasks.length === 0 && milestones.length === 0 ? (
                  <div className="empty">Add your first task to start planning.</div>
                ) : (
                  sectionsWithTasks.map((section) => (
                    <div key={section.id}>
                      <div className="section-row">
                        <span className="dot" style={{ backgroundColor: section.color }} />
                        <span>{section.name}</span>
                      </div>
                      {section.tasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className={task.id === selectedId ? 'task-row active' : 'task-row'}
                          onClick={() => selectTask(task.id)}
                        >
                          <span className="dot" style={{ backgroundColor: task.color }} />
                          <span className="task-text">
                            <span className="task-name">{task.name}</span>
                            <span className="task-date">
                              {task.start} → {task.end}
                            </span>
                          </span>
                        </button>
                      ))}
                      {section.milestones.map((milestone) => (
                        <button
                          key={milestone.id}
                          type="button"
                          className={
                            milestone.id === selectedMilestoneId
                              ? 'task-row milestone-row active'
                              : 'task-row milestone-row'
                          }
                          onClick={() => selectMilestone(milestone.id)}
                        >
                          <span className="diamond" style={{ backgroundColor: milestone.color }} />
                          <span className="task-text">
                            <span className="task-name">{milestone.name}</span>
                            <span className="task-date">{milestone.date}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>

              <div className="gantt-right">
                <div className="gantt-timeline" style={{ '--days': days.length }}>
                <div className="timeline-header" style={{ '--days': days.length }}>
                  <div className="month-row" style={{ '--days': days.length }}>
                    {monthSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className="month-cell"
                        style={{ gridColumn: `span ${segment.span}` }}
                      >
                        <span>{segment.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="day-row" style={{ '--cols': headerSegments.length }}>
                    {headerSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className={segment.major ? 'day-cell major' : 'day-cell'}
                      >
                        <span>{segment.label}</span>
                      </div>
                    ))}
                  </div>
                  {markerIndexes.map((marker) => {
                    const left = ((marker.dayIndex + 0.5) / days.length) * 100;
                    return (
                      <div
                        key={`marker-ind-${marker.id}`}
                        className="marker-indicator"
                        style={{ left: `${left}%`, backgroundColor: marker.color }}
                        title={marker.label}
                      />
                    );
                  })}
                </div>
                <div
                  className="timeline-body"
                  ref={timelineRef}
                  style={{ '--cols': timelineSegments.length, '--days': days.length }}
                >
                  {offDayIndexes.map((dayIndex) => {
                    const left = (dayIndex / days.length) * 100;
                    const width = (1 / days.length) * 100;
                    return (
                      <div
                        key={`off-${dayIndex}`}
                        className="off-segment"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    );
                  })}
                  {markerIndexes.map((marker) => {
                    const left = (marker.dayIndex / days.length) * 100;
                    const width = (1 / days.length) * 100;
                    return (
                      <div
                        key={`marker-${marker.id}`}
                        className="marker-segment"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: marker.color,
                        }}
                      />
                    );
                  })}
                  {sectionsWithTasks.map((section) => (
                    <React.Fragment key={`timeline-${section.id}`}>
                      <div className="timeline-row section-row" />
                      {section.tasks.map((task) => {
                        const startMs = parseDateUTC(task.start);
                        const endMs = parseDateUTC(task.end);
                        if (startMs === null || endMs === null) return null;

                        const startIndexRaw = clamp(
                          dayDiff(rangeStartMs, startMs),
                          0,
                          days.length - 1
                        );
                        const endIndexRaw = clamp(dayDiff(rangeStartMs, endMs), 0, days.length - 1);
                        const startIndex = Math.min(startIndexRaw, endIndexRaw);
                        const endIndex = Math.max(startIndexRaw, endIndexRaw);
                        const startSegment = dayToSegment[startIndex] ?? 0;
                        const endSegment = dayToSegment[endIndex] ?? startSegment;
                        const left = (startSegment / timelineSegments.length) * 100;
                        const width =
                          ((endSegment - startSegment + 1) / timelineSegments.length) * 100;

                        return (
                          <div key={task.id} className="timeline-row">
                            <div
                              className={task.id === selectedId ? 'bar active' : 'bar'}
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                backgroundColor: task.color,
                              }}
                              onPointerDown={(event) => handleBarPointerDown(event, task, 'move')}
                              onClick={() => selectTask(task.id)}
                            >
                              <div
                                className="handle left"
                                onPointerDown={(event) =>
                                  handleBarPointerDown(event, task, 'resize-left')
                                }
                              />
                              <span>{task.name}</span>
                              <div
                                className="handle right"
                                onPointerDown={(event) =>
                                  handleBarPointerDown(event, task, 'resize-right')
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                      {section.milestones.map((milestone) => {
                        const dateMs = parseDateUTC(milestone.date);
                        if (dateMs === null) return null;

                        const dayIndex = clamp(dayDiff(rangeStartMs, dateMs), 0, days.length - 1);
                        const segment = dayToSegment[dayIndex] ?? 0;
                        const left = ((segment + 0.5) / timelineSegments.length) * 100;

                        return (
                          <div key={milestone.id} className="timeline-row">
                            <div
                              className={
                                milestone.id === selectedMilestoneId
                                  ? 'milestone-marker active'
                                  : 'milestone-marker'
                              }
                              style={{
                                left: `${left}%`,
                                backgroundColor: milestone.color,
                              }}
                              onClick={() => selectMilestone(milestone.id)}
                            />
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                </div>
              </div>
              {markers.length > 0 && (
                <div className="marker-legend">
                  <span className="legend-title">Markers</span>
                  {markers.map((marker) => (
                    <span key={marker.id} className="legend-item">
                      <span
                        className="legend-swatch"
                        style={{ backgroundColor: marker.color }}
                      />
                      {marker.label} ({formatMonthDay(marker.date)})
                    </span>
                  ))}
                </div>
              )}
            </div>
      </section>

      {selectedTask && (
        <>
          <div className="task-detail-overlay" onClick={() => selectTask(null)} />
          <div className="task-detail-panel">
            <button
              className="panel-close"
              type="button"
              onClick={() => selectTask(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2>Task details</h2>
            <div className="panel-fields">
              <label>
                Name
                <input
                  value={selectedTask.name}
                  onChange={(event) => updateTask(selectedTask.id, { name: event.target.value })}
                />
              </label>
              <label>
                Start date
                <input
                  type="date"
                  value={selectedTask.start}
                  onChange={(event) => updateTask(selectedTask.id, { start: event.target.value })}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  value={selectedTask.end}
                  onChange={(event) => updateTask(selectedTask.id, { end: event.target.value })}
                />
              </label>
              <label>
                Section
                <select
                  value={selectedTask.sectionId || ''}
                  onChange={(event) => {
                    const newSectionId = event.target.value;
                    const sectionColor = sections.find(s => s.id === newSectionId)?.color || palette[0];
                    updateTask(selectedTask.id, { sectionId: newSectionId, color: sectionColor });
                  }}
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Description
                <textarea
                  rows="4"
                  value={selectedTask.description || ''}
                  onChange={(event) =>
                    updateTask(selectedTask.id, { description: event.target.value })
                  }
                  placeholder="Summarize goals, references, or deliverables for this task."
                />
              </label>
              <button
                className="ghost danger"
                type="button"
                onClick={() => {
                  setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
                  setSelectedId(null);
                }}
              >
                Delete task
              </button>
            </div>
          </div>
        </>
      )}

      {selectedMilestone && (
        <>
          <div className="task-detail-overlay" onClick={() => setSelectedMilestoneId(null)} />
          <div className="task-detail-panel">
            <button
              className="panel-close"
              type="button"
              onClick={() => setSelectedMilestoneId(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2>Milestone details</h2>
            <div className="panel-fields">
              <label>
                Name
                <input
                  value={selectedMilestone.name}
                  onChange={(event) =>
                    updateMilestone(selectedMilestone.id, { name: event.target.value })
                  }
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={selectedMilestone.date}
                  onChange={(event) =>
                    updateMilestone(selectedMilestone.id, { date: event.target.value })
                  }
                />
              </label>
              <label>
                Section
                <select
                  value={selectedMilestone.sectionId || ''}
                  onChange={(event) => {
                    const newSectionId = event.target.value;
                    const sectionColor =
                      sections.find((s) => s.id === newSectionId)?.color || palette[0];
                    updateMilestone(selectedMilestone.id, {
                      sectionId: newSectionId,
                      color: sectionColor,
                    });
                  }}
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="ghost danger"
                type="button"
                onClick={() => {
                  setMilestones((prev) =>
                    prev.filter((m) => m.id !== selectedMilestone.id)
                  );
                  setSelectedMilestoneId(null);
                }}
              >
                Delete milestone
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
