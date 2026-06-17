import { Autocomplete, Box, Card, Flex, Text } from "@sanity/ui";
import { icons } from "lucide-react";
import { set, StringInputProps } from "sanity";

const options = Object.keys(icons).map((name) => ({
  value: name,
  payload: name,
}));

export function LucideIconInput(props: StringInputProps) {
  const { value, onChange } = props;

  const Icon =
    value && value in icons ? icons[value as keyof typeof icons] : null;

  return (
    <Box>
      <Autocomplete
        id={value as string}
        options={options}
        value={value}
        onChange={(val) => onChange(set(val))}
        renderOption={(option) => {
          const Icon = icons[option.value as keyof typeof icons];

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
