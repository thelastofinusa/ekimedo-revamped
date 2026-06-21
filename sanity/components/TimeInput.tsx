import React from "react";
import { Stack, TextInput } from "@sanity/ui";
import { set, StringInputProps } from "sanity";

export function TimeInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(set(event.target.value));
  };

  return (
    <Stack space={2}>
      <TextInput
        {...elementProps}
        type="time"
        step="900" // 15-minute increments (optional)
        value={value || ""}
        onChange={handleChange}
      />
    </Stack>
  );
}
