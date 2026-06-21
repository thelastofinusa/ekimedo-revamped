import React from "react";
import { Card, Stack, Text, Box, Label, Flex } from "@sanity/ui";
import { useFormValue } from "sanity";

interface FormFieldItem {
  _key: string;
  fieldName: string;
  fieldLabel: string;
  value: string;
}

export function BookingFormFields(props: { value?: FormFieldItem[] }) {
  const { value } = props;

  // Get the formData from the parent document
  const formData = useFormValue(["formData"]) as string | undefined;

  // Try to parse formData
  let parsedData: [string, unknown][] | null = null;
  let parseError = false;
  if (formData) {
    try {
      const parsed = JSON.parse(formData);
      if (parsed && typeof parsed === "object") {
        parsedData = Object.entries(parsed);
      }
    } catch {
      parseError = true;
    }
  }

  // If we have parsed data, display it
  if (parsedData && parsedData.length > 0) {
    return (
      <Card padding={3} border>
        <Stack gap={3}>
          {parsedData.map(([key, val], index) => (
            <Box key={key}>
              <Flex direction="column" gap={1}>
                <Label size={1} muted>
                  {key}
                </Label>
                <Text size={2}>{String(val)}</Text>
              </Flex>
              {index < parsedData.length - 1 && (
                <div
                  style={{
                    borderBottom: "1px solid var(--card-border-color)",
                    marginTop: "8px",
                  }}
                />
              )}
            </Box>
          ))}
        </Stack>
      </Card>
    );
  }

  // If we have formData but couldn't parse, show a message
  if (formData && parseError) {
    return <Text muted>Unable to parse form data</Text>;
  }

  // Fallback: use value array if provided
  if (!value || value.length === 0) {
    return <Text muted>No form data</Text>;
  }

  return (
    <Card padding={3} border>
      <Stack gap={4}>
        {value.map((item, index) => (
          <Box key={item._key}>
            <Flex direction="column" gap={1}>
              <Label size={1} muted>
                {item.fieldLabel || item.fieldName}
              </Label>
              <Text size={2}>{item.value}</Text>
            </Flex>
            {index < value.length - 1 && (
              <div
                style={{
                  borderBottom: "1px solid var(--card-border-color)",
                  marginTop: "8px",
                }}
              />
            )}
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
