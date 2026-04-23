"use client";

import { useEffect, useRef, useState } from "react";

type Select2Option = {
  id: string;
  text: string;
  [key: string]: any;
};

type Props = {
  options: Select2Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const Select2Dropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}: Props) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [select2Instance, setSelect2Instance] = useState<any>(null);

  // Initialize Select2 only on client side
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Load Select2 CSS if not already loaded
    if (!document.getElementById("select2-css")) {
      const link = document.createElement("link");
      link.id = "select2-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css";
      document.head.appendChild(link);
    }
    
    // Dynamically import jQuery and Select2 on client side only
    const initSelect2 = async () => {
      const $ = (await import("jquery")).default;
      await import("select2");

      if (!selectRef.current) return;

      const $select = $(selectRef.current);
      $select.select2({
        placeholder: placeholder,
        allowClear: true,
        width: "100%",
        data: options,
      });

      if (value) {
        $select.val(value);
      }

      $select.on("change.select2", () => {
        const selectedValue = $select.val() as string;
        onChange(selectedValue);
      });

      setSelect2Instance($select);
      setIsInitialized(true);
    };

    initSelect2();

    return () => {
      if (selectRef.current && select2Instance) {
        const $ = require("jquery");
        const $el = $(selectRef.current);
        if ($el.data("select2")) {
          $el.select2("destroy");
        }
        $el.off("change.select2");
      }
    };
  }, []);

  // Update options when they change
  useEffect(() => {
    if (!isInitialized || !selectRef.current || !select2Instance) return;

    const $select = select2Instance;
    const select2Data = $select.data("select2");
    
    if (select2Data) {
      // Update the data
      select2Data.data.options.data = options;
      
      // Clear and repopulate
      $select.empty();
      $select.append(new Option("", "", true, !value));
      
      options.forEach((option) => {
        const optionEl = new Option(option.text, option.id, false, option.id === value);
        $select.append(optionEl);
      });
      
      $select.trigger("change");
    }
  }, [options, isInitialized, select2Instance, value]);

  // Update value when it changes externally
  useEffect(() => {
    if (!isInitialized || !selectRef.current || !select2Instance) return;
    
    const $select = select2Instance;
    const currentValue = $select.val();
    
    if (currentValue !== value) {
      $select.val(value).trigger("change");
    }
  }, [value, isInitialized, select2Instance]);

  // Handle disabled state
  useEffect(() => {
    if (!isInitialized || !selectRef.current || !select2Instance) return;
    
    const $select = select2Instance;
    $select.prop("disabled", disabled);
    $select.trigger("change");
  }, [disabled, isInitialized, select2Instance]);

  return (
    <select
      ref={selectRef}
      className={className}
      defaultValue={value}
    >
      <option value="">Select an option...</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.text}
        </option>
      ))}
    </select>
  );
};
