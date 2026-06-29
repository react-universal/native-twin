import type { ReactNode } from "react";

interface PlaygroundLayoutProps {
  children: ReactNode;
}

export const PlaygroundLayout = ({ children }: PlaygroundLayoutProps) => {
  return (
    <div className="flex flex-1 h-screen w-screen bg-[#1f1f1f]">
      <div className="w-full h-full flex flex-1">{children}</div>
    </div>
  );
};
