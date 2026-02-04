import React from 'react';

export default function ControlPanel({
  isOpen,
  onClose,
  controlTab,
  setControlTab,
  newTask,
  setNewTask,
  newTaskMode,
  setNewTaskMode,
  newTaskDuration,
  setNewTaskDuration,
  sections,
  addTask,
  newMilestone,
  setNewMilestone,
  addMilestone,
  newSectionName,
  setNewSectionName,
  newSectionColor,
  setNewSectionColor,
  palette,
  addSection,
  updateSection,
  deleteSection,
  newOffDay,
  setNewOffDay,
  paddingDays,
  setPaddingDays,
  addOffDay,
  offWeekdays,
  setOffWeekdays,
  offDays,
  removeOffDay,
  newMarker,
  setNewMarker,
  addMarker,
  markers,
  removeMarker,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="task-detail-overlay" onClick={onClose} />
      <div className="task-detail-panel control-panel">
        <button className="panel-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Add & manage</h2>
        <div className="toolbar-tabs">
          {[
            ['tasks', 'Tasks'],
            ['milestones', 'Milestones'],
            ['sections', 'Sections'],
            ['schedule', 'Schedule'],
          ].map(([key, label]) => (
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
          <div className="panel-fields">
            <label>
              Task name
              <input
                value={newTask.name}
                onChange={(event) => setNewTask((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Design sprint"
              />
            </label>
            <label>
              Start date
              <input
                type="date"
                value={newTask.start}
                onChange={(event) =>
                  setNewTask((prev) => ({ ...prev, start: event.target.value }))
                }
              />
            </label>
            <div className="mode-toggle">
              <span>Date mode</span>
              {[
                ['end', 'End date'],
                ['duration', 'Duration'],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  className={newTaskMode === mode ? 'chip active' : 'chip'}
                  onClick={() => setNewTaskMode(mode)}
                >
                  {label}
                </button>
              ))}
            </div>
            {newTaskMode === 'end' ? (
              <label>
                End date
                <input
                  type="date"
                  value={newTask.end}
                  onChange={(event) =>
                    setNewTask((prev) => ({ ...prev, end: event.target.value }))
                  }
                />
              </label>
            ) : (
              <label>
                Duration (days)
                <input
                  type="number"
                  min="1"
                  value={newTaskDuration}
                  onChange={(event) => setNewTaskDuration(Number(event.target.value) || 1)}
                />
              </label>
            )}
            <label>
              Section
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
            </label>
            <button className="primary" type="button" onClick={addTask}>
              Add task
            </button>
          </div>
        )}

        {controlTab === 'milestones' && (
          <div className="panel-fields">
            <label>
              Milestone name
              <input
                value={newMilestone.name}
                onChange={(event) =>
                  setNewMilestone((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Deadline"
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={newMilestone.date}
                onChange={(event) =>
                  setNewMilestone((prev) => ({ ...prev, date: event.target.value }))
                }
              />
            </label>
            <label>
              Section
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
            </label>
            <button className="primary" type="button" onClick={addMilestone}>
              Add milestone
            </button>
          </div>
        )}

        {controlTab === 'sections' && (
          <div className="panel-fields">
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
            <div className="section-edit-list">
              {sections.map((section) => (
                <div key={section.id} className="section-edit-row">
                  <span className="dot" style={{ backgroundColor: section.color }} />
                  <input
                    value={section.name}
                    onChange={(event) => updateSection(section.id, { name: event.target.value })}
                  />
                  <button
                    className="ghost danger"
                    type="button"
                    onClick={() => deleteSection(section.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {controlTab === 'schedule' && (
          <div className="panel-fields">
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
                  <button key={day} type="button" className="chip" onClick={() => removeOffDay(day)}>
                    {day} ×
                  </button>
                ))}
              </div>
            )}
            <h3 className="schedule-subhead">Day markers</h3>
            <label>
              Label
              <input
                value={newMarker.label}
                onChange={(event) => setNewMarker((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="Project deadline"
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={newMarker.date}
                onChange={(event) => setNewMarker((prev) => ({ ...prev, date: event.target.value }))}
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
            {markers.length > 0 && (
              <div className="marker-list">
                {markers.map((marker) => (
                  <button
                    key={marker.id}
                    type="button"
                    className="chip marker-chip"
                    onClick={() => removeMarker(marker.id)}
                  >
                    <span className="marker-dot" style={{ backgroundColor: marker.color }} />
                    {marker.label} ({marker.date}) ×
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
