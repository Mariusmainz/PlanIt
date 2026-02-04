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
          <label className="progress-toggle-label">
            <input
              type="checkbox"
              checked={!!task.progressEnabled}
              onChange={(event) => updateTask(task.id, { progressEnabled: event.target.checked })}
            />
            Track progress
          </label>
          {task.progressEnabled && (
            <>
              <div className="mode-toggle">
                <span>Mode</span>
                {[
                  ['manual', 'Manual'],
                  ['subtasks', 'Subtasks'],
                ].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    className={(task.progressMode || 'manual') === mode ? 'chip active' : 'chip'}
                    onClick={() => updateTask(task.id, { progressMode: mode })}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {(task.progressMode || 'manual') === 'manual' && (
                <label>
                  Progress ({task.progressManual ?? 0}%)
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={task.progressManual ?? 0}
                    onChange={(event) =>
                      updateTask(task.id, { progressManual: Number(event.target.value) })
                    }
                  />
                </label>
              )}
              {task.progressMode === 'subtasks' && (
                <div className="subtask-section">
                  <div className="subtask-progress-label">
                    {(() => {
                      const subs = task.subtasks || [];
                      const done = subs.filter((s) => s.completed).length;
                      const pct = subs.length === 0 ? 0 : Math.round((done / subs.length) * 100);
                      return `${done} of ${subs.length} complete (${pct}%)`;
                    })()}
                  </div>
                  <div className="subtask-list">
                    {(task.subtasks || []).map((sub) => (
                      <div key={sub.id} className="subtask-item">
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() => {
                            const updated = (task.subtasks || []).map((s) =>
                              s.id === sub.id ? { ...s, completed: !s.completed } : s
                            );
                            updateTask(task.id, { subtasks: updated });
                          }}
                        />
                        <span className={sub.completed ? 'subtask-name completed' : 'subtask-name'}>
                          {sub.name}
                        </span>
                        <button
                          type="button"
                          className="subtask-remove"
                          onClick={() => {
                            const updated = (task.subtasks || []).filter((s) => s.id !== sub.id);
                            updateTask(task.id, { subtasks: updated });
                          }}
                          aria-label="Remove subtask"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="subtask-add">
                    <input
                      placeholder="Add a subtask..."
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter') return;
                        const name = event.target.value.trim();
                        if (!name) return;
                        const id = `st-${Date.now()}-${Math.round(Math.random() * 1000)}`;
                        const updated = [...(task.subtasks || []), { id, name, completed: false }];
                        updateTask(task.id, { subtasks: updated });
                        event.target.value = '';
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          <button className="ghost danger" type="button" onClick={onDelete}>
            Delete task
          </button>
        </div>
      </div>
    </>
  );
}
