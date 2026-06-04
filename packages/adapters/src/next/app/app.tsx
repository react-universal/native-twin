import {
  install,
  type TailwindConfig,
  type TailwindUserConfig,
} from "@native-twin/core";
import { type SheetEntry, sheetEntriesToCss } from "@native-twin/css";
import { getNonce } from "@native-twin/helpers";
import { useServerInsertedHTML } from "next/navigation.js";
import { type ReactNode, useState } from "react";
import { StyleSheet } from "react-native";

interface AppComponentProps {
  children: ReactNode;
}
export const NativeTwinSheet = (
  twinConfig: TailwindUserConfig | TailwindConfig
) => {
  const AppComponent = ({ children }: AppComponentProps) => {
    const [twin] = useState(() => {
      const config = Object.assign(
        { mode: "web" },
        twinConfig
      ) as TailwindUserConfig;
      return install(config, !__DEV__);
    });
    useServerInsertedHTML(() => {
      // @ts-expect-error asd
      const rnSheet = StyleSheet.getSheet();
      console.log("SERVER_INSERT");
      return (
        <>
          <style
            // @ts-expect-error asd
            nonce={getNonce()}
            dangerouslySetInnerHTML={{
              __html: rnSheet.textContent,
            }}
          />
          <style
            data-native-twin=""
            // @ts-expect-error asd
            nonce={getNonce()}
            dangerouslySetInnerHTML={{
              __html: sheetEntriesToCss((twin.target ?? []) as SheetEntry[]),
            }}
          />
        </>
      );
    });
    return <>{children}</>;
  };

  return AppComponent;
};
