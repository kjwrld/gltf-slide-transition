import React from "react";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max: number;
  step: number;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  max,
  step,
  className,
}: SliderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseFloat(event.target.value)]);
  };

  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={`w-full ${className}`}
    />
  );
}
