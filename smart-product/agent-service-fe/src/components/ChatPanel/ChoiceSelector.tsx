import { useState } from 'react';
import './ChatPanel.scss';

interface Props {
  options: string[];
  type: string;
  onSelect: (value: string) => void;
}

export default function ChoiceSelector({ options, type, onSelect }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  if (type === 'multiselect') {
    const toggle = (opt: string) => {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
      );
    };

    return (
      <div className="choice-selector">
        <div className="choice-selector__label">Select all that apply:</div>
        <div className="choice-selector__options">
          {options.map((opt) => (
            <label key={opt} className="choice-selector__option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
        <button
          className="choice-selector__submit"
          onClick={() => {
            if (selected.length > 0) {
              onSelect(selected.join(', '));
              setSelected([]);
            }
          }}
          disabled={selected.length === 0}
        >
          Confirm Selection
        </button>
      </div>
    );
  }

  // select / radio — single pick
  return (
    <div className="choice-selector">
      <div className="choice-selector__label">Choose one:</div>
      <div className="choice-selector__options">
        {options.map((opt) => (
          <button
            key={opt}
            className="choice-selector__chip"
            onClick={() => onSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
