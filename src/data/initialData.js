export const initialTasks = [
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

export const initialSections = [
  { id: 's1', name: 'Research', color: '#f4b740' },
  { id: 's2', name: 'Writing', color: '#61c0bf' },
  { id: 's3', name: 'Review', color: '#b07cf7' },
];

export const initialMilestones = [
  {
    id: 'm1',
    name: 'Thesis Proposal Due',
    date: '2026-02-14',
    color: '#f78883',
    sectionId: 's1',
  },
];

export const palette = ['#f4b740', '#61c0bf', '#5b8def', '#f78883', '#b07cf7', '#87c38f'];
