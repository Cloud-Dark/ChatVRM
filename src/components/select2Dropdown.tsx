import { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "select2";

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

  useEffect(() => {
    if (!selectRef.current) return;

    // Initialize Select2
    const $select = $(selectRef.current) as any;
    $select.select2({
      placeholder: placeholder,
      allowClear: true,
      width: "100%",
      data: options,
    });

    // Set initial value
    if (value) {
      $select.val(value);
    }

    // Handle change event
    $select.on("change", () => {
      const selectedValue = $select.val() as string;
      onChange(selectedValue);
    });

    setIsInitialized(true);

    // Cleanup
    return () => {
      if (selectRef.current) {
        const $el = $(selectRef.current) as any;
        if ($el.data("select2")) {
          $el.select2("destroy");
        }
      }
    };
  }, []);

  // Update options when they change
  useEffect(() => {
    if (!isInitialized || !selectRef.current) return;

    const $select = $(selectRef.current) as any;
    const select2Instance = $select.data("select2");
    
    if (select2Instance) {
      // Update the data
      select2Instance.data.options.data = options;
      
      // Clear and repopulate
      $select.empty();
      $select.append(new Option("", "", true, !value));
      
      options.forEach((option) => {
        const optionEl = new Option(option.text, option.id, false, option.id === value);
        $select.append(optionEl);
      });
      
      $select.trigger("change");
    }
  }, [options, isInitialized, value]);

  // Update value when it changes externally
  useEffect(() => {
    if (!isInitialized || !selectRef.current) return;
    
    const $select = $(selectRef.current) as any;
    const currentValue = $select.val();
    
    if (currentValue !== value) {
      $select.val(value).trigger("change");
    }
  }, [value, isInitialized]);

  // Handle disabled state
  useEffect(() => {
    if (!isInitialized || !selectRef.current) return;
    
    const $select = $(selectRef.current) as any;
    $select.prop("disabled", disabled);
    $select.trigger("change");
  }, [disabled, isInitialized]);

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
