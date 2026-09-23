"use client";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  id?: string;
  compact?: boolean;
};

export default function NumberField({ label, value, onChange, prefix, suffix, step = 1, min = 0, id, compact }: Props) {
  const fid = id || label.toLowerCase().replace(/\W+/g, "-");
  return (
    <label htmlFor={fid} className="block">
      <span className={compact ? "sr-only" : "mb-1.5 block text-sm font-medium text-muted"}>{label}</span>
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{prefix}</span>}
        <input
          id={fid}
          type="number"
          inputMode="decimal"
          className="field"
          style={{ paddingLeft: prefix ? "1.6rem" : undefined, paddingRight: suffix ? "2rem" : undefined }}
          value={Number.isFinite(value) ? value : ""}
          min={min}
          step={step}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">{suffix}</span>}
      </span>
    </label>
  );
}
