import { set, StringInputProps } from "sanity";
import { Autocomplete, Box, Card, Flex, Text } from "@sanity/ui";

import { iconRegistry } from "@/lib/icons";

const options = Object.keys(iconRegistry)
  .filter(
    (key) =>
      typeof iconRegistry[key as keyof typeof iconRegistry] === "function",
  )
  .map((name) => ({
    value: name,
    payload: name,
  }));

export const ReactIcons = (props: StringInputProps) => {
  const Icon = iconRegistry[props.value as keyof typeof iconRegistry];

  return (
    <Box>
      <Autocomplete
        id={props.value as string}
        options={options}
        value={props.value}
        onChange={(val) => props.onChange(set(val))}
        renderOption={(option) => {
          const Icon = iconRegistry[option.value as keyof typeof iconRegistry];

          return (
            <Flex align="center" gap={3}>
              <Icon size={18} />
              <Text>{option.value}</Text>
            </Flex>
          );
        }}
      />

      {Icon && (
        <Card padding={3} marginTop={3}>
          <Flex align="center" gap={3}>
            <Icon size={24} />
            <Text>{props.value}</Text>
          </Flex>
        </Card>
      )}
    </Box>
  );
};
