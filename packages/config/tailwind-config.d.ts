import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';
declare const createTailwindConfig: (initialConfig: TailwindConfig) => {
    getConfig: () => TailwindConfig;
    setConfig: (userConfig: TailwindConfig) => TailwindConfig;
};
export { createTailwindConfig };
//# sourceMappingURL=tailwind-config.d.ts.map