import * as React from "react";

export function useAsRef<T>(value: T) {
  const ref = React.useRef(value);

  React.useLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
