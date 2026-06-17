import { iconRegistry } from "@/lib/icons-registry";
import { Autocomplete, Box, Card, Flex, Text } from "@sanity/ui";

import { set, StringInputProps } from "sanity";

const options = Object.keys(iconRegistry)
  .filter(
    (key) =>
      typeof iconRegistry[key as keyof typeof iconRegistry] === "function",
  )
  .map((name) => ({
    value: name,
    payload: name,
  }));

export function ReactIconsIconInput(props: StringInputProps) {
  const { value, onChange } = props;

  const Icon = iconRegistry[value as keyof typeof iconRegistry];

  return (
    <Box>
      <Autocomplete
        id={value as string}
        options={options}
        value={value}
        onChange={(val) => onChange(set(val))}
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
            <Text>{value}</Text>
          </Flex>
        </Card>
      )}
    </Box>
  );
}
