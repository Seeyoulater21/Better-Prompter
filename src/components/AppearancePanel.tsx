import type { PrompterSettings } from "../types";

type AppearancePanelProps = {
  settings: PrompterSettings;
  onChange: (settings: PrompterSettings) => void;
};

type NumberSettingKey =
  | "fontSizePt"
  | "horizontalMarginPercent"
  | "verticalMarginPercent"
  | "lineSpacingPercent"
  | "scrollSpeedPercent";

type ToggleSettingKey =
  | "mirrorOutput"
  | "showReadLinePreview"
  | "showReadLineOutput"
  | "showSafeFramePreview"
  | "showSafeFrameOutput";

const numberControls: Array<{
  key: NumberSettingKey;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: "fontSizePt", label: "Font Size", min: 24, max: 140, step: 1 },
  { key: "horizontalMarginPercent", label: "Horizontal Margin", min: 0, max: 30, step: 1 },
  { key: "verticalMarginPercent", label: "Vertical Margin", min: 0, max: 30, step: 1 },
  { key: "lineSpacingPercent", label: "Line Spacing", min: 90, max: 180, step: 5 },
  { key: "scrollSpeedPercent", label: "Scroll Speed", min: 0, max: 100, step: 1 },
];

const toggleControls: Array<{ key: ToggleSettingKey; label: string }> = [
  { key: "mirrorOutput", label: "Mirror Output" },
  { key: "showReadLinePreview", label: "Read Line Preview" },
  { key: "showReadLineOutput", label: "Read Line Output" },
  { key: "showSafeFramePreview", label: "Safe Frame Preview" },
  { key: "showSafeFrameOutput", label: "Safe Frame Output" },
];

export function AppearancePanel({ settings, onChange }: AppearancePanelProps) {
  const updateNumber = (key: NumberSettingKey, value: string) => {
    onChange({ ...settings, [key]: Number(value) });
  };

  const updateToggle = (key: ToggleSettingKey, checked: boolean) => {
    onChange({ ...settings, [key]: checked });
  };

  return (
    <section className="panel appearance-panel" aria-labelledby="appearance-heading">
      <h2 id="appearance-heading">Appearance</h2>
      <div className="appearance-grid">
        {numberControls.map((control) => (
          <label className="control-row" key={control.key}>
            <span>{control.label}</span>
            <input
              max={control.max}
              min={control.min}
              onChange={(event) => updateNumber(control.key, event.target.value)}
              step={control.step}
              type="number"
              value={settings[control.key]}
            />
          </label>
        ))}
        <label className="control-row color-row">
          <span>Text Color</span>
          <input
            aria-label="Text Color"
            onChange={(event) => onChange({ ...settings, textColor: event.target.value })}
            type="color"
            value={settings.textColor}
          />
        </label>
        <label className="control-row color-row">
          <span>Background Color</span>
          <input
            aria-label="Background Color"
            onChange={(event) => onChange({ ...settings, backgroundColor: event.target.value })}
            type="color"
            value={settings.backgroundColor}
          />
        </label>
        {toggleControls.map((control) => (
          <label className="toggle-row" key={control.key}>
            <span>{control.label}</span>
            <input
              checked={settings[control.key]}
              onChange={(event) => updateToggle(control.key, event.target.checked)}
              type="checkbox"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
