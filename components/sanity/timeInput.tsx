import React from "react";
import { Stack, TextInput } from "@sanity/ui";
import { set, StringInputProps } from "sanity";

export const TimeInput = (props: StringInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(set(event.target.value));
  };

  return (
    <Stack space={2}>
      <TextInput
        {...props.elementProps}
        type="time"
        step="900"
        value={props.value || ""}
        onChange={handleChange}
      />
    </Stack>
  );
};
