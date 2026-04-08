"use client";

import { useState, useRef, useEffect } from "react";

interface ComboboxWithAddProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  addLabel: string;
  onAddNew?: (value: string) => Promise<void>;
}

export default function ComboboxWithAdd({
  value,
  onChange,
  options,
  placeholder,
  addLabel,
  onAddNew,
}: ComboboxWithAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase();
  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(query)
  );
  const exactMatch = options.some((o) => o.toLowerCase() === query);
  const showAddOption = query.length > 0 && !exactMatch;

  const displayOptions = showAddOption
    ? [...filteredOptions, `__ADD__${value.trim()}`]
    : filteredOptions;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value, displayOptions.length]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (option: string) => {
    if (option.startsWith("__ADD__")) {
      const newValue = option.replace("__ADD__", "");
      if (onAddNew) {
        try {
          await onAddNew(newValue);
        } catch {
          // Parent may have shown error; still set value so user keeps their input
        }
      }
      onChange(newValue);
    } else {
      onChange(option);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setHighlightedIndex((i) =>
          i < displayOptions.length - 1 ? i + 1 : 0
        );
        e.preventDefault();
        break;
      case "ArrowUp":
        setHighlightedIndex((i) =>
          i > 0 ? i - 1 : displayOptions.length - 1
        );
        e.preventDefault();
        break;
      case "Enter":
        if (displayOptions[highlightedIndex]) {
          handleSelect(displayOptions[highlightedIndex]);
        }
        e.preventDefault();
        break;
      case "Escape":
        setIsOpen(false);
        e.preventDefault();
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
      />
      {isOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {displayOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">No options</li>
          ) : (
            displayOptions.map((opt, i) => {
              const isAdd = opt.startsWith("__ADD__");
              const displayText = isAdd
                ? `${addLabel}: ${opt.replace("__ADD__", "")}`
                : opt;
              const isHighlighted = i === highlightedIndex;

              return (
                <li
                  key={isAdd ? `add-${opt}` : opt}
                  role="option"
                  aria-selected={isHighlighted}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    isHighlighted
                      ? "bg-storesight-purple/10 text-storesight-purple"
                      : "text-gray-900 hover:bg-gray-50"
                  } ${isAdd ? "italic" : ""}`}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                >
                  {displayText}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
