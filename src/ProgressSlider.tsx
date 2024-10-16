import React from "react";
import { Slider } from "./components/Slider";

interface ProgressSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ProgressSlider({
  value,
  onChange,
}: ProgressSliderProps) {
  const handleValueChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 bg-opacity-50">
      <Slider
        value={[value]}
        onValueChange={handleValueChange}
        max={1}
        step={0.01}
        className="w-full"
      />
    </div>
  );
}
