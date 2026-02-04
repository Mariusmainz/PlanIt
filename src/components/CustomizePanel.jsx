import React from 'react';

const fontOptions = [
  { label: 'Space Grotesk', value: '"Space Grotesk", system-ui, sans-serif' },
  { label: 'IBM Plex Sans', value: '"IBM Plex Sans", system-ui, sans-serif' },
  { label: 'Work Sans', value: '"Work Sans", system-ui, sans-serif' },
  { label: 'Source Sans 3', value: '"Source Sans 3", system-ui, sans-serif' },
];

export default function CustomizePanel({
  isOpen,
  onClose,
  presets,
  activePresetId,
  onSelectPreset,
  theme,
  onUpdateTheme,
  onReset,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="task-detail-overlay" onClick={onClose} />
      <div className="task-detail-panel control-panel">
        <button className="panel-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Customize roadmap</h2>
        <div className="panel-fields">
          <div className="customize-actions">
            <button className="ghost" type="button" onClick={onReset}>
              Reset to default
            </button>
          </div>
          <div className="preset-grid">
            {presets.map((preset) => (
              <button
                key={preset.id}
                className={preset.id === activePresetId ? 'preset-card active' : 'preset-card'}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
              >
                <div className="preset-preview" style={{ background: preset.vars['--gantt-bg'] }}>
                  <div
                    className="preview-bar"
                    style={{
                      background: preset.vars['--page-accent'],
                      borderRadius: preset.vars['--gantt-bar-radius'],
                      boxShadow: preset.vars['--gantt-bar-shadow'],
                    }}
                  />
                  <div
                    className="preview-bar short"
                    style={{
                      background: preset.vars['--page-bg-1'],
                      borderRadius: preset.vars['--gantt-bar-radius'],
                      boxShadow: preset.vars['--gantt-bar-shadow'],
                    }}
                  />
                </div>
                <span className="preset-name">{preset.name}</span>
                <span className="preset-desc">{preset.description}</span>
              </button>
            ))}
          </div>
          <label>
            Roadmap font
            <select
              value={theme['--gantt-font']}
              onChange={(event) => onUpdateTheme({ '--gantt-font': event.target.value })}
            >
              {fontOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Grid line opacity
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={Number(theme['--gantt-grid-opacity'] ?? 0.06)}
              onChange={(event) =>
                onUpdateTheme({ '--gantt-grid-opacity': Number(event.target.value) })
              }
            />
          </label>
          <label>
            Task text size
            <input
              type="range"
              min="0.85"
              max="1.2"
              step="0.01"
              value={Number(theme['--gantt-text-scale'] ?? 1)}
              onChange={(event) =>
                onUpdateTheme({ '--gantt-text-scale': Number(event.target.value) })
              }
            />
          </label>
          <label>
            Section text size
            <input
              type="range"
              min="0.85"
              max="1.2"
              step="0.01"
              value={Number(theme['--gantt-section-scale'] ?? 1)}
              onChange={(event) =>
                onUpdateTheme({ '--gantt-section-scale': Number(event.target.value) })
              }
            />
          </label>
          <label>
            Corner roundness
            <input
              type="range"
              min="4"
              max="20"
              step="1"
              value={Number.parseFloat(theme['--gantt-bar-radius'] || '11')}
              onChange={(event) =>
                onUpdateTheme({ '--gantt-bar-radius': `${event.target.value}px` })
              }
            />
          </label>
        </div>
      </div>
    </>
  );
}
