import React, { useEffect, useMemo, useRef, useState } from 'react';
import ControlPanel from './components/ControlPanel';
import CustomizePanel from './components/CustomizePanel';
import MilestoneDetailPanel from './components/MilestoneDetailPanel';
import TaskDetailPanel from './components/TaskDetailPanel';
import { initialMilestones, initialSections, initialTasks, palette } from './data/initialData';
import {
  DAY_MS,
  clamp,
  dayDiff,
  formatDateUTC,
  formatMonthDay,
  formatMonthLabel,
  parseDateUTC,
} from './utils/date';
import {
  buildCsv,
  buildExportSvg,
  downloadFile,
  downloadPng,
  openPrintWindow,
} from './utils/exporters';

export default function App() {
  const themePresets = [
    {
      id: 'sunset',
      name: 'Sunset Studio',
      vars: {
        '--gantt-font': '"Space Grotesk", system-ui, sans-serif',
        '--page-font-body': '"Space Grotesk", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#fffefb',
        '--gantt-left-bg': '#fff9f1',
        '--gantt-header-bg': '#fffdf8',
        '--gantt-heading-bg': '#fff3e4',
        '--gantt-section-bg': 'rgba(255, 227, 198, 0.6)',
        '--gantt-text': '#1c1a17',
        '--gantt-muted': '#5f5a55',
        '--gantt-grid-opacity': 0.06,
        '--gantt-text-scale': 1,
        '--gantt-section-scale': 1,
        '--gantt-bar-radius': '11px',
        '--page-bg-1': '#ffe7c2',
        '--page-bg-2': '#ffdfdb',
        '--page-bg-3': '#fff6ea',
        '--page-bg-4': '#f1e8dd',
        '--page-bg-5': '#efe4d6',
        '--page-text': '#1c1a17',
        '--page-muted': '#5f5a55',
        '--page-accent': '#e06d3a',
        '--panel-bg': '#f8f3ec',
        '--panel-text': '#1c1a17',
        '--panel-muted': '#5f5a55',
        '--panel-input-bg': '#fffdf9',
      },
    },
    {
      id: 'ink',
      name: 'Ink & Linen',
      vars: {
        '--gantt-font': '"IBM Plex Sans", system-ui, sans-serif',
        '--page-font-body': '"IBM Plex Sans", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#f8f6f2',
        '--gantt-left-bg': '#f1eee7',
        '--gantt-header-bg': '#f9f7f2',
        '--gantt-heading-bg': '#f0ece4',
        '--gantt-section-bg': 'rgba(220, 211, 197, 0.7)',
        '--gantt-text': '#151515',
        '--gantt-muted': '#5e5b55',
        '--gantt-grid-opacity': 0.08,
        '--gantt-text-scale': 0.98,
        '--gantt-section-scale': 0.98,
        '--gantt-bar-radius': '8px',
        '--page-bg-1': '#e7eef8',
        '--page-bg-2': '#f2efe8',
        '--page-bg-3': '#f8f5ee',
        '--page-bg-4': '#efe9de',
        '--page-bg-5': '#eae1d4',
        '--page-text': '#151515',
        '--page-muted': '#5e5b55',
        '--page-accent': '#3b6ea5',
        '--panel-bg': '#f3efe7',
        '--panel-text': '#151515',
        '--panel-muted': '#5e5b55',
        '--panel-input-bg': '#fffaf2',
      },
    },
    {
      id: 'mint',
      name: 'Mint Graph',
      vars: {
        '--gantt-font': '"Work Sans", system-ui, sans-serif',
        '--page-font-body': '"Work Sans", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#f7fbf9',
        '--gantt-left-bg': '#eef7f2',
        '--gantt-header-bg': '#f4faf7',
        '--gantt-heading-bg': '#e8f5ef',
        '--gantt-section-bg': 'rgba(212, 241, 229, 0.7)',
        '--gantt-text': '#16332c',
        '--gantt-muted': '#4f6a62',
        '--gantt-grid-opacity': 0.05,
        '--gantt-text-scale': 1,
        '--gantt-section-scale': 1,
        '--gantt-bar-radius': '14px',
        '--page-bg-1': '#d7f3ea',
        '--page-bg-2': '#f2efe6',
        '--page-bg-3': '#f8f6ee',
        '--page-bg-4': '#eff3e8',
        '--page-bg-5': '#e7efe3',
        '--page-text': '#16332c',
        '--page-muted': '#4f6a62',
        '--page-accent': '#2a9d8f',
        '--panel-bg': '#eef6f1',
        '--panel-text': '#16332c',
        '--panel-muted': '#4f6a62',
        '--panel-input-bg': '#f7fbf9',
      },
    },
    {
      id: 'night',
      name: 'Midnight Ledger',
      vars: {
        '--gantt-font': '"IBM Plex Sans", system-ui, sans-serif',
        '--page-font-body': '"IBM Plex Sans", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#0f1419',
        '--gantt-left-bg': '#141b22',
        '--gantt-header-bg': '#101820',
        '--gantt-heading-bg': '#18212a',
        '--gantt-section-bg': 'rgba(30, 42, 52, 0.9)',
        '--gantt-text': '#f4f7fb',
        '--gantt-muted': '#a6b2bd',
        '--gantt-grid-opacity': 0.04,
        '--gantt-text-scale': 0.98,
        '--gantt-section-scale': 0.95,
        '--gantt-bar-radius': '10px',
        '--page-bg-1': '#0b1117',
        '--page-bg-2': '#101923',
        '--page-bg-3': '#0f141a',
        '--page-bg-4': '#121b24',
        '--page-bg-5': '#151f2a',
        '--page-text': '#f4f7fb',
        '--page-muted': '#b5c0cb',
        '--page-accent': '#8ab4ff',
        '--panel-bg': '#141b22',
        '--panel-text': '#f4f7fb',
        '--panel-muted': '#b5c0cb',
        '--panel-input-bg': '#1b2430',
      },
    },
    {
      id: 'orchid',
      name: 'Orchid Draft',
      vars: {
        '--gantt-font': '"Source Sans 3", system-ui, sans-serif',
        '--page-font-body': '"Source Sans 3", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#fbf6ff',
        '--gantt-left-bg': '#f3ecff',
        '--gantt-header-bg': '#f8f2ff',
        '--gantt-heading-bg': '#efe3ff',
        '--gantt-section-bg': 'rgba(230, 214, 255, 0.7)',
        '--gantt-text': '#2b2137',
        '--gantt-muted': '#6c5d85',
        '--gantt-grid-opacity': 0.06,
        '--gantt-text-scale': 1,
        '--gantt-section-scale': 1,
        '--gantt-bar-radius': '16px',
        '--page-bg-1': '#efe2ff',
        '--page-bg-2': '#f6efff',
        '--page-bg-3': '#fbf7ff',
        '--page-bg-4': '#f2eaff',
        '--page-bg-5': '#eadfff',
        '--page-text': '#2b2137',
        '--page-muted': '#6c5d85',
        '--page-accent': '#7b5dd6',
        '--panel-bg': '#f4ecff',
        '--panel-text': '#2b2137',
        '--panel-muted': '#6c5d85',
        '--panel-input-bg': '#fbf6ff',
      },
    },
    {
      id: 'graphite',
      name: 'Graphite Grid',
      vars: {
        '--gantt-font': '"Space Grotesk", system-ui, sans-serif',
        '--page-font-body': '"Space Grotesk", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#f6f6f6',
        '--gantt-left-bg': '#efefef',
        '--gantt-header-bg': '#f7f7f7',
        '--gantt-heading-bg': '#e6e6e6',
        '--gantt-section-bg': 'rgba(220, 220, 220, 0.7)',
        '--gantt-text': '#1e1e1e',
        '--gantt-muted': '#5b5b5b',
        '--gantt-grid-opacity': 0.12,
        '--gantt-text-scale': 0.98,
        '--gantt-section-scale': 0.95,
        '--gantt-bar-radius': '6px',
        '--page-bg-1': '#f0f0f0',
        '--page-bg-2': '#f8f8f8',
        '--page-bg-3': '#f5f5f5',
        '--page-bg-4': '#ededed',
        '--page-bg-5': '#e6e6e6',
        '--page-text': '#1e1e1e',
        '--page-muted': '#5b5b5b',
        '--page-accent': '#e06d3a',
        '--panel-bg': '#f4f4f4',
        '--panel-text': '#1e1e1e',
        '--panel-muted': '#5b5b5b',
        '--panel-input-bg': '#ffffff',
      },
    },
    {
      id: 'blueprint',
      name: 'Blueprint',
      vars: {
        '--gantt-font': '"IBM Plex Sans", system-ui, sans-serif',
        '--page-font-body': '"IBM Plex Sans", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#0b1b32',
        '--gantt-left-bg': '#10223d',
        '--gantt-header-bg': '#0f213a',
        '--gantt-heading-bg': '#142945',
        '--gantt-section-bg': 'rgba(24, 48, 82, 0.9)',
        '--gantt-text': '#e7f0ff',
        '--gantt-muted': '#9fb4d1',
        '--gantt-grid-opacity': 0.05,
        '--gantt-text-scale': 0.98,
        '--gantt-section-scale': 0.95,
        '--gantt-bar-radius': '8px',
        '--page-bg-1': '#0a1628',
        '--page-bg-2': '#0f2036',
        '--page-bg-3': '#0c1a2e',
        '--page-bg-4': '#11243c',
        '--page-bg-5': '#132742',
        '--page-text': '#e7f0ff',
        '--page-muted': '#9fb4d1',
        '--page-accent': '#75a7ff',
        '--panel-bg': '#121f33',
        '--panel-text': '#e7f0ff',
        '--panel-muted': '#9fb4d1',
        '--panel-input-bg': '#1b2b45',
      },
    },
    {
      id: 'archivist',
      name: 'Archivist',
      vars: {
        '--gantt-font': '"Source Sans 3", system-ui, sans-serif',
        '--page-font-body': '"Source Sans 3", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#fbf7ef',
        '--gantt-left-bg': '#f3ede2',
        '--gantt-header-bg': '#faf4ea',
        '--gantt-heading-bg': '#efe4d4',
        '--gantt-section-bg': 'rgba(227, 214, 196, 0.7)',
        '--gantt-text': '#2b2620',
        '--gantt-muted': '#6f6457',
        '--gantt-grid-opacity': 0.09,
        '--gantt-text-scale': 1,
        '--gantt-section-scale': 1,
        '--gantt-bar-radius': '12px',
        '--page-bg-1': '#f3eadc',
        '--page-bg-2': '#f8f0e5',
        '--page-bg-3': '#fbf4ea',
        '--page-bg-4': '#efe4d5',
        '--page-bg-5': '#e7d9c7',
        '--page-text': '#2b2620',
        '--page-muted': '#6f6457',
        '--page-accent': '#b4683b',
        '--panel-bg': '#f6efe3',
        '--panel-text': '#2b2620',
        '--panel-muted': '#6f6457',
        '--panel-input-bg': '#fff7ef',
      },
    },
    {
      id: 'terra',
      name: 'Terra',
      vars: {
        '--gantt-font': '"Work Sans", system-ui, sans-serif',
        '--page-font-body': '"Work Sans", system-ui, sans-serif',
        '--page-font-heading': '"Fraunces", serif',
        '--gantt-bg': '#f6efe6',
        '--gantt-left-bg': '#efe5d7',
        '--gantt-header-bg': '#f5ece1',
        '--gantt-heading-bg': '#e8d9c6',
        '--gantt-section-bg': 'rgba(225, 205, 179, 0.75)',
        '--gantt-text': '#2b241d',
        '--gantt-muted': '#746558',
        '--gantt-grid-opacity': 0.08,
        '--gantt-text-scale': 1,
        '--gantt-section-scale': 0.98,
        '--gantt-bar-radius': '10px',
        '--page-bg-1': '#efe2d0',
        '--page-bg-2': '#f6ecdf',
        '--page-bg-3': '#f8f0e6',
        '--page-bg-4': '#eadac6',
        '--page-bg-5': '#e0cfba',
        '--page-text': '#2b241d',
        '--page-muted': '#746558',
        '--page-accent': '#c06b3f',
        '--panel-bg': '#f2e6d7',
        '--panel-text': '#2b241d',
        '--panel-muted': '#746558',
        '--panel-input-bg': '#fbf2e8',
      },
    },
  ];

  const [projectName, setProjectName] = useState('Title');
  const [projectSubtitle, setProjectSubtitle] = useState('Thesis roadmap and milestones');
  const [tasks, setTasks] = useState(initialTasks);
  const [sections, setSections] = useState(initialSections);
  const [selectedId, setSelectedId] = useState(null);
  const [paddingDays, setPaddingDays] = useState(3);
  const [exportFormat, setExportFormat] = useState('json');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [autoFit, setAutoFit] = useState(false);
  const [offDays, setOffDays] = useState(['2026-02-09', '2026-02-16']);
  const [offWeekdays, setOffWeekdays] = useState([6]);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [newMilestone, setNewMilestone] = useState(() => ({
    name: 'New milestone',
    date: formatDateUTC(Date.now()),
    sectionId: initialSections[0]?.id ?? '',
    symbol: 'diamond',
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
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [newTaskMode, setNewTaskMode] = useState('end');
  const [newTaskDuration, setNewTaskDuration] = useState(3);
  const [rowHeight, setRowHeight] = useState(56);
  const [activeThemeId, setActiveThemeId] = useState(themePresets[0].id);
  const [themeVars, setThemeVars] = useState(themePresets[0].vars);
  const themeClass = 'theme-adaptive';
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  const timelineRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const ganttViewportRef = useRef(null);
  const ganttRef = useRef(null);
  const dragState = useRef(null);
  const lastDragRef = useRef({ id: null, ts: 0 });
  const listDragRef = useRef(null);
  const [dragOver, setDragOver] = useState(null);

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

  const cellWidth = useMemo(() => 40 * zoom, [zoom]);

  const timelineSegments = useMemo(() => {
    return days.map((day, index) => ({
      id: day,
      label: day.slice(8),
      span: 1,
      major: index % 7 === 0,
      startIndex: index,
    }));
  }, [days]);

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

  const headerSegments = useMemo(() => {
    let step = 1;
    if (cellWidth < 10) step = 4;
    else if (cellWidth < 14) step = 3;
    else if (cellWidth < 18) step = 2;
    return days.map((day, index) => ({
      id: `day-${day}`,
      label: index % step === 0 ? day.slice(8) : '',
      major: index % 7 === 0,
      span: 1,
    }));
  }, [days, cellWidth]);

  const weekHeaderSegments = useMemo(() => {
    const segments = [];
    const showFull = cellWidth * 7 >= 64;
    for (let index = 0; index < days.length; index += 7) {
      const weekNumber = Math.floor(index / 7) + 1;
      segments.push({
        id: `week-header-${index}`,
        label: showFull ? `Week ${weekNumber}` : `${weekNumber}`,
        major: true,
        span: Math.min(7, days.length - index),
      });
    }
    return segments;
  }, [days, cellWidth]);

  const monthHeaderSegments = useMemo(() => monthSegments, [monthSegments]);

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
    if (!titleRef.current) return;
    titleRef.current.style.height = 'auto';
    titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
  }, [projectName]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    body.classList.add('theme-adaptive');
    Object.entries(themeVars).forEach(([key, value]) => {
      if (key.startsWith('--page-') || key.startsWith('--panel-')) {
        root.style.setProperty(key, String(value));
      }
    });
    return () => {
      body.classList.remove('theme-adaptive');
    };
  }, [themeVars]);


  useEffect(() => {
    if (!subtitleRef.current) return;
    subtitleRef.current.style.height = 'auto';
    subtitleRef.current.style.height = `${subtitleRef.current.scrollHeight}px`;
  }, [projectSubtitle]);

  useEffect(() => {
    if (!autoFit) return;
    const baseWidth = days.length * 40;
    const containerWidth = ganttViewportRef.current?.clientWidth || 0;
    if (!baseWidth || !containerWidth) return;
    const nextZoom = clamp(containerWidth / baseWidth, 0.05, 4);
    setZoom(Number(nextZoom.toFixed(2)));
  }, [autoFit, days.length, timelineWidth]);

  useEffect(() => {
    const target = ganttViewportRef.current;
    if (!target) return;
    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setAutoFit(false);
      setZoom((prev) => clamp(Number((prev + delta).toFixed(2)), 0.05, 4));
    };
    target.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      target.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const target = ganttRef.current;
    if (!target) return;
    const handleWheel = (event) => {
      if (!event.altKey) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -4 : 4;
      setRowHeight((prev) => clamp(prev + delta, 40, 92));
    };
    target.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      target.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.key === '+' || event.key === '=' || event.key === '-') {
        event.preventDefault();
        const delta = event.key === '-' ? -0.1 : 0.1;
        setAutoFit(false);
        setZoom((prev) => clamp(Number((prev + delta).toFixed(2)), 0.05, 4));
      }
      if (event.key === '0') {
        event.preventDefault();
        setAutoFit(false);
        setZoom(1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragState.current) return;
      if (!timelineWidth || days.length === 0) return;

      const dayWidth = timelineWidth / days.length;
      const deltaDays = Math.round((event.clientX - dragState.current.initialX) / dayWidth);

      if (deltaDays === dragState.current.lastDelta) return;
      if (deltaDays !== 0) dragState.current.moved = true;
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
      if (dragState.current?.moved) {
        lastDragRef.current = { id: dragState.current.id, ts: Date.now() };
      }
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
    let endMs = parseDateUTC(newTask.end);
    if (!startMs) return;
    if (newTaskMode === 'duration') {
      const duration = Math.max(1, Number(newTaskDuration) || 1);
      endMs = startMs + (duration - 1) * DAY_MS;
    }
    if (!endMs) return;
    const [safeStart, safeEnd] = startMs <= endMs ? [startMs, endMs] : [endMs, startMs];

    const id = `t-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const task = {
      id,
      name: newTask.name.trim() || 'Untitled task',
      start: formatDateUTC(safeStart),
      end: formatDateUTC(safeEnd),
      color:
        sections.find((s) => s.id === (newTask.sectionId || sections[0]?.id))?.color ||
        palette[0],
      description: newTask.description.trim(),
      sectionId: newTask.sectionId || sections[0]?.id || '',
    };
    setTasks((prev) => [...prev, task]);
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

  const updateSection = (id, patch) => {
    setSections((prev) =>
      prev.map((section) => (section.id === id ? { ...section, ...patch } : section))
    );
  };

  const deleteSection = (id) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
    setTasks((prev) =>
      prev.map((task) => (task.sectionId === id ? { ...task, sectionId: '' } : task))
    );
    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.sectionId === id ? { ...milestone, sectionId: '' } : milestone
      )
    );
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
      symbol: newMilestone.symbol || 'diamond',
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

  const exportRows = useMemo(() => {
    const rows = [];
    sectionsWithTasks.forEach((section) => {
      rows.push({ type: 'section', section });
      section.tasks.forEach((task) => rows.push({ type: 'task', task }));
      section.milestones.forEach((milestone) =>
        rows.push({ type: 'milestone', milestone })
      );
    });
    return rows;
  }, [sectionsWithTasks]);

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
      moved: false,
    };

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleBarClick = (taskId) => {
    const lastDrag = lastDragRef.current;
    if (lastDrag.id === taskId && Date.now() - lastDrag.ts < 250) return;
    selectTask(taskId);
  };

  const moveItemById = (list, id, beforeId) => {
    const fromIndex = list.findIndex((item) => item.id === id);
    const toIndex = list.findIndex((item) => item.id === beforeId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return list;
    const next = [...list];
    const [item] = next.splice(fromIndex, 1);
    const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    next.splice(insertIndex, 0, item);
    return next;
  };

  const moveTaskToSection = (taskId, targetSectionId) => {
    setTasks((prev) => {
      const fromIndex = prev.findIndex((task) => task.id === taskId);
      if (fromIndex < 0) return prev;
      const next = [...prev];
      const [task] = next.splice(fromIndex, 1);
      const sectionColor = sections.find((section) => section.id === targetSectionId)?.color;
      const updatedTask = {
        ...task,
        sectionId: targetSectionId,
        color: sectionColor || task.color,
      };
      let insertIndex = next.length;
      for (let i = next.length - 1; i >= 0; i -= 1) {
        if (next[i].sectionId === targetSectionId) {
          insertIndex = i + 1;
          break;
        }
      }
      next.splice(insertIndex, 0, updatedTask);
      return next;
    });
  };

  const handleSectionDragStart = (event, section) => {
    listDragRef.current = { type: 'section', id: section.id };
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragStart = (event, task) => {
    listDragRef.current = { type: 'task', id: task.id, sectionId: task.sectionId };
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleListDragEnd = () => {
    listDragRef.current = null;
    setDragOver(null);
  };

  const handleSectionDrop = (event, section) => {
    event.preventDefault();
    const drag = listDragRef.current;
    if (!drag) return;
    const targetSectionId = section.id === 'unassigned' ? '' : section.id;
    if (drag.type === 'section') {
      if (drag.id === section.id) return;
      setSections((prev) => moveItemById(prev, drag.id, section.id));
    } else if (drag.type === 'task') {
      moveTaskToSection(drag.id, targetSectionId);
    }
    listDragRef.current = null;
    setDragOver(null);
  };

  const handleTaskDrop = (event, task) => {
    event.preventDefault();
    const drag = listDragRef.current;
    if (!drag || drag.type !== 'task' || drag.id === task.id) return;
    setTasks((prev) => {
      const fromIndex = prev.findIndex((entry) => entry.id === drag.id);
      const toIndex = prev.findIndex((entry) => entry.id === task.id);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      const [movedTask] = next.splice(fromIndex, 1);
      const targetSectionId = task.sectionId;
      const sectionColor = sections.find((section) => section.id === targetSectionId)?.color;
      const updatedTask = {
        ...movedTask,
        sectionId: targetSectionId,
        color: sectionColor || movedTask.color,
      };
      const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
      next.splice(insertIndex, 0, updatedTask);
      return next;
    });
    listDragRef.current = null;
    setDragOver(null);
  };

  const handleExport = async (format = exportFormat) => {
    if (tasks.length === 0) return;
    const baseName = projectName.trim().replace(/\s+/g, '-').toLowerCase() || 'project-plan';
    if (format === 'svg') {
      const { svg } = buildExportSvg({
        projectName,
        projectSubtitle,
        days,
        rows: exportRows,
        markerIndexes,
        offDayIndexes,
      });
      downloadFile({
        name: `${baseName}.svg`,
        mime: 'image/svg+xml',
        contents: svg,
      });
      return;
    }
    if (format === 'png') {
      const { svg } = buildExportSvg({
        projectName,
        projectSubtitle,
        days,
        rows: exportRows,
        markerIndexes,
        offDayIndexes,
      });
      await downloadPng({ name: `${baseName}.png`, svg });
      return;
    }
    if (format === 'csv') {
      downloadFile({
        name: `${baseName}.csv`,
        mime: 'text/csv',
        contents: buildCsv({ tasks, sections, milestones }),
      });
      return;
    }
    if (format === 'pdf') {
      openPrintWindow({
        projectName,
        projectSubtitle,
        days,
        rows: exportRows,
        markerIndexes,
        offDayIndexes,
      });
    }
  };

  return (
    <div className={`app ${themeClass}`}>
      <header className="hero">
        <div>
          <p className="eyebrow">RoadMate</p>
          <h1>Shape your roadmap effortlessly.</h1>
          <p className="sub">
            Drag to move, stretch to resize, and keep your plan clean with automatic formatting.
          </p>
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
        </div>
        <div className="export-panel">
          <button className="ghost" type="button" onClick={() => setIsCustomizeOpen(true)}>
            Customize
          </button>
          <button
            className="primary"
            type="button"
            onClick={() => setIsExportOpen((prev) => !prev)}
          >
            Export
          </button>
          {isExportOpen && (
            <div className="export-popover">
              {[
                ['png', 'PNG'],
                ['svg', 'SVG'],
                ['pdf', 'PDF (print)'],
                ['csv', 'CSV'],
              ].map(([format, label]) => (
                <button
                  key={format}
                  type="button"
                  className="export-option"
                  onClick={() => {
                    setExportFormat(format);
                    setIsExportOpen(false);
                    handleExport(format);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="panel">
        <div className="panel-head">
          <div className="panel-title">
            <textarea
              className="title-input"
              ref={titleRef}
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              rows={1}
            />
            <textarea
              className="subtitle-input"
              ref={subtitleRef}
              value={projectSubtitle}
              onChange={(event) => setProjectSubtitle(event.target.value)}
              placeholder="Project subtitle"
              rows={1}
            />
          </div>
          <button
            className="ghost"
            type="button"
            onClick={() => {
              setSelectedId(null);
              setSelectedMilestoneId(null);
              setIsControlPanelOpen(true);
            }}
          >
            + Add
          </button>
        </div>

            <div
              className="gantt"
              ref={ganttRef}
              style={{
                '--task-row-height': `${rowHeight}px`,
                ...themeVars,
              }}
            >
              <div className="gantt-left">
                <div className="gantt-header">Tasks</div>
                {tasks.length === 0 && milestones.length === 0 ? (
                  <div className="empty">Add your first task to start planning.</div>
                ) : (
                  sectionsWithTasks.map((section) => (
                    <div key={section.id}>
                      <div
                        className={`section-row list-section-row${
                          dragOver?.type === 'section' && dragOver.id === section.id
                            ? ' drop-target'
                            : ''
                        }${
                          dragOver?.type === 'section-reorder' && dragOver.id === section.id
                            ? ' drop-reorder'
                            : ''
                        }`}
                        draggable={section.id !== 'unassigned'}
                        onDragStart={(event) =>
                          section.id === 'unassigned' ? null : handleSectionDragStart(event, section)
                        }
                        onDragEnd={handleListDragEnd}
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (listDragRef.current?.type === 'task') {
                            setDragOver({ type: 'section', id: section.id });
                          } else if (listDragRef.current?.type === 'section') {
                            setDragOver({ type: 'section-reorder', id: section.id });
                          }
                        }}
                        onDragLeave={() => setDragOver((prev) => (prev?.id === section.id ? null : prev))}
                        onDrop={(event) => handleSectionDrop(event, section)}
                      >
                        <span className="dot" style={{ backgroundColor: section.color }} />
                        <span>{section.name}</span>
                      </div>
                      {section.tasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className={`${task.id === selectedId ? 'task-row active' : 'task-row'}${
                            dragOver?.type === 'task' && dragOver.id === task.id ? ' drop-target' : ''
                          }`}
                          onClick={() => selectTask(task.id)}
                          draggable
                          onDragStart={(event) => handleTaskDragStart(event, task)}
                          onDragEnd={handleListDragEnd}
                          onDragOver={(event) => {
                            event.preventDefault();
                            if (listDragRef.current?.type === 'task') {
                              setDragOver({ type: 'task', id: task.id });
                            }
                          }}
                          onDragLeave={() => setDragOver((prev) => (prev?.id === task.id ? null : prev))}
                          onDrop={(event) => handleTaskDrop(event, task)}
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
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={handleListDragEnd}
                        >
                          <span
                            className={`milestone-shape ${milestone.symbol || 'diamond'}`}
                            style={{ backgroundColor: milestone.color }}
                          />
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

              <div className="gantt-right" ref={ganttViewportRef}>
                <div
                  className="gantt-timeline"
                  style={{
                    '--days': days.length,
                    '--cols': days.length,
                    '--zoom': zoom,
                    '--zoom-cols': days.length,
                  }}
                >
                <div className="timeline-header" style={{ '--days': days.length }}>
                  <div
                    className="month-row"
                    style={{
                      '--days': days.length,
                      '--month-cols': days.length,
                    }}
                  >
                    {monthHeaderSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className="month-cell"
                        style={{ gridColumn: `span ${segment.span}` }}
                      >
                        <span>{segment.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="week-row" style={{ '--cols': days.length }}>
                    {weekHeaderSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className="week-cell"
                        style={{ gridColumn: `span ${segment.span}` }}
                      >
                        <span>{segment.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="day-row" style={{ '--cols': days.length }}>
                    {headerSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className={segment.major ? 'day-cell major' : 'day-cell'}
                        style={{ gridColumn: `span ${segment.span}` }}
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
                  className={cellWidth < 14 ? 'timeline-body no-grid' : 'timeline-body'}
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
                        const totalWidth =
                          timelineRef.current?.scrollWidth || timelineWidth || 0;
                        const barPixelWidth = (width / 100) * totalWidth;
                        const showLabel = barPixelWidth >= 80;

                        return (
                          <div key={task.id} className="timeline-row">
                            <div
                              className={`${task.id === selectedId ? 'bar active' : 'bar'}${
                                showLabel ? '' : ' compact'
                              }`}
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                backgroundColor: task.color,
                              }}
                              onPointerDown={(event) => handleBarPointerDown(event, task, 'move')}
                              onClick={() => handleBarClick(task.id)}
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
                                  ? `milestone-marker ${milestone.symbol || 'diamond'} active`
                                  : `milestone-marker ${milestone.symbol || 'diamond'}`
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

      <ControlPanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
        controlTab={controlTab}
        setControlTab={setControlTab}
        newTask={newTask}
        setNewTask={setNewTask}
        newTaskMode={newTaskMode}
        setNewTaskMode={setNewTaskMode}
        newTaskDuration={newTaskDuration}
        setNewTaskDuration={setNewTaskDuration}
        sections={sections}
        addTask={addTask}
        newMilestone={newMilestone}
        setNewMilestone={setNewMilestone}
        addMilestone={addMilestone}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
        newSectionColor={newSectionColor}
        setNewSectionColor={setNewSectionColor}
        palette={palette}
        addSection={addSection}
        updateSection={updateSection}
        deleteSection={deleteSection}
        newOffDay={newOffDay}
        setNewOffDay={setNewOffDay}
        paddingDays={paddingDays}
        setPaddingDays={setPaddingDays}
        addOffDay={addOffDay}
        offWeekdays={offWeekdays}
        setOffWeekdays={setOffWeekdays}
        offDays={offDays}
        removeOffDay={removeOffDay}
        newMarker={newMarker}
        setNewMarker={setNewMarker}
        addMarker={addMarker}
        markers={markers}
        removeMarker={removeMarker}
      />

      <CustomizePanel
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        presets={themePresets}
        activePresetId={activeThemeId}
        onSelectPreset={(id) => {
          const preset = themePresets.find((entry) => entry.id === id);
          if (!preset) return;
          setActiveThemeId(id);
          setThemeVars(preset.vars);
        }}
        theme={themeVars}
        onUpdateTheme={(patch) =>
          setThemeVars((prev) => ({
            ...prev,
            ...patch,
          }))
        }
        onReset={() => {
          const preset = themePresets[0];
          setActiveThemeId(preset.id);
          setThemeVars(preset.vars);
        }}
      />

      <TaskDetailPanel
        task={selectedTask}
        onClose={() => selectTask(null)}
        updateTask={updateTask}
        sections={sections}
        palette={palette}
        onDelete={() => {
          setTasks((prev) => prev.filter((task) => task.id !== selectedTask?.id));
          setSelectedId(null);
        }}
      />

      <MilestoneDetailPanel
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestoneId(null)}
        updateMilestone={updateMilestone}
        sections={sections}
        palette={palette}
        onDelete={() => {
          setMilestones((prev) => prev.filter((m) => m.id !== selectedMilestone?.id));
          setSelectedMilestoneId(null);
        }}
      />
    </div>
  );
}
