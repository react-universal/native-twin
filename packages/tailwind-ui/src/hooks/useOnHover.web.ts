import { useMemo, useState } from 'react';

export const useOnHover = () => {
  const [state, setHovered] = useState(0);

  const hoverHandler = useMemo(() => {
    return {
      onHoverIn: () => {
        setHovered(1);
      },
      onHoverOut: () => {
        setHovered(0);
      },
      hovered: { value: state },
    };
  }, [state]);

  return hoverHandler;
};
