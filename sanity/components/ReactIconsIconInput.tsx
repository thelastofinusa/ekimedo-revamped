import { Autocomplete, Box, Card, Flex, Text } from "@sanity/ui";
import * as FaIcons from "react-icons/fa6";
import { set, StringInputProps } from "sanity";

const options = Object.keys(FaIcons)
  .filter((key) => {
    const Icon = FaIcons[key as keyof typeof FaIcons];

    return typeof Icon === "function" && key !== "IconContext";
  })
  .map((name) => ({
    value: name,
    payload: name,
  }));

export function ReactIconsIconInput(props: StringInputProps) {
  const { value, onChange } = props;

  const Icon =
    value && value in FaIcons ? FaIcons[value as keyof typeof FaIcons] : null;

  return (
    <Box>
      <Autocomplete
        id={value as string}
        options={options}
        value={value}
        onChange={(val) => onChange(set(val))}
        renderOption={(option) => {
          const Icon = FaIcons[option.value as keyof typeof FaIcons];

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
