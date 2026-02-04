import React from 'react';

export default function MilestoneDetailPanel({
  milestone,
  onClose,
  updateMilestone,
  sections,
  palette,
  onDelete,
}) {
  if (!milestone) return null;

  return (
    <>
      <div className="task-detail-overlay" onClick={onClose} />
      <div className="task-detail-panel">
        <button className="panel-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Milestone details</h2>
        <div className="panel-fields">
          <label>
            Name
            <input
              value={milestone.name}
              onChange={(event) => updateMilestone(milestone.id, { name: event.target.value })}
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={milestone.date}
              onChange={(event) => updateMilestone(milestone.id, { date: event.target.value })}
            />
          </label>
          <label>
            Section
            <select
              value={milestone.sectionId || ''}
              onChange={(event) => {
                const newSectionId = event.target.value;
                const sectionColor = sections.find((s) => s.id === newSectionId)?.color || palette[0];
                updateMilestone(milestone.id, { sectionId: newSectionId, color: sectionColor });
              }}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>
          <button className="ghost danger" type="button" onClick={onDelete}>
            Delete milestone
          </button>
        </div>
      </div>
    </>
  );
}
