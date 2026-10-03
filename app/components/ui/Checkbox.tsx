interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <label className="flex items-center gap-1.5 font-mono text-xs text-neutral-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="cursor-pointer accent-neutral-800 disabled:opacity-50"
      />
      {/* long unbroken labels (a URL) wrap instead of overflowing a narrow screen */}
      <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
    </label>
  );
}
