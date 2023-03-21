# Installation

You have two options to use tailwindcss in you React Native project.

## Install Universal Labs in your project

### Option 1 (Recommended): Using primitives
This option already gives you all React Native primitives pre-configured to use classNames or tw prop.

```
yarn add @universal-labs/primitives 
```

### Option 2 (Manual): Using styled HOC

This options allows you to create your own primitives and styled any component.

```
yarn add @universal-labs/styled 
```

## Tailwind

### Install

```
yarn add -D tailwindcss
```

### Setup Tailwind

Run `npx tailwindcss init` to create a `tailwind.config.js` file Add the paths to all of your component files in your tailwind.config.js file. Remember to replace `<custom directory>` with the actual name of your directory e.g. `screens`.