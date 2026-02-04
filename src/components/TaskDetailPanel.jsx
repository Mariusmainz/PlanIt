import React from 'react';

export default function TaskDetailPanel({
  task,
  onClose,
  updateTask,
  sections,
  palette,
  onDelete,
}) {
  if (!task) return null;

  return (
    <>
      <div className="task-detail-overlay" onClick={onClose} />
      <div className="task-detail-panel">
        <button className="panel-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Task details</h2>
        <div className="panel-fields">
          <label>
            Name
            <input value={task.name} onChange={(event) => updateTask(task.id, { name: event.target.value })} />
          </label>
          <label>
            Start date
            <input
              type="date"
              value={task.start}
              onChange={(event) => updateTask(task.id, { start: event.target.value })}
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={task.end}
              onChange={(event) => updateTask(task.id, { end: event.target.value })}
            />
          </label>
          <label>
            Section
            <select
              value={task.sectionId || ''}
              onChange={(event) => {
                const newSectionId = event.target.value;
                const sectionColor = sections.find((s) => s.id === newSectionId)?.color || palette[0];
                updateTask(task.id, { sectionId: newSectionId, color: sectionColor });
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
              value={task.description || ''}
              onChange={(event) => updateTask(task.id, { description: event.target.value })}
              placeholder="Summarize goals, references, or deliverables for this task."
            />
          </label>
          <button className="ghost danger" type="button" onClick={onDelete}>
            Delete task
          </button>
        </div>
      </div>
    </>
  );
}
