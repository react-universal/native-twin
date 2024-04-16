"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@native-twin/core");
const preset_tailwind_1 = require("@native-twin/preset-tailwind");
exports.default = (0, core_1.defineConfig)({
    content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
    root: {
        rem: 16,
    },
    theme: {
        extend: {
            colors: {
                primary: 'blue',
            },
            fontFamily: {
                DEFAULT: 'Inter-Regular',
                inter: 'Inter-Regular',
                'inter-bold': 'Inter-Bold',
                'inter-medium': 'Inter-Medium',
                sans: 'Inter-Regular',
            },
        },
    },
    presets: [(0, preset_tailwind_1.presetTailwind)()],
});
//# sourceMappingURL=tailwind.config.js.map