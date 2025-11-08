import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: number;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  unit = 1,
  step,
  min,
  max,
  placeholder,
  labelClassName = "block mb-1 font-bold",
  inputClassName = "w-full p-2 border rounded box-border",
}) => (
  <>
    <label className={labelClassName}>{label}</label>
    <input
      type="number"
      value={value / unit}
      onChange={(e) => {
        const numValue = parseFloat(e.target.value);
        if (!isNaN(numValue)) {
          onChange(numValue * unit);
        }
      }}
      step={step}
      min={min}
      max={max}
      placeholder={placeholder}
      className={inputClassName}
    />
  </>
);
