<div align="center">
  <p align="center">
    <a href="https://tailwind-docs.vercel.app/" target="_blank">
      <img src="./assets/react-universal-tailwind-logo.png" alt="React Universal Tailwind Logo" width="70" height="70">
      <h1 align="center" style="color:red;">React Universal Tailwind</h1>
    </a>
      <p>React UniversalLabs simplifies the integration of Tailwind CSS framework in React Native hybrid apps. Our main goal is to bridge the gap for React web developers in need to write universal components for native and web. <br/> 
      This package allows developers to write Tailwind CSS classes with all states (active, hover, focus) that just works and looks as expected in native.</p>
  </p>
  <img alt="GitHub main branch checks state" src="https://img.shields.io/github/checks-status/react-universal/tailwind/main">
  <a href="http://commitizen.github.io/cz-cli/" target="_blank">
    <img alt="Commitizen friendly" src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg">
  </a>
  <a href="https://www.npmjs.com/package/@universal-labs/styled" target="_blank">
    <img alt="npm version" src="https://img.shields.io/npm/v/@universal-labs/styled">
    <img alt="npm downloads" src="https://img.shields.io/npm/dt/@universal-labs/styled">
  </a>
  <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/react-universal/tailwind">
  <img alt="GitHub" src="https://img.shields.io/github/license/react-universal/tailwind">
</div>
<br />

## Features

- Uses Tailwind CSS in React Native.
- Universal Design.
- Fast compilations with **Vite**.
- No Babel dependencies.
- **TypeScript** by default.
- CSS in TS.
- Visual States (_hover, active, focus_)
- Family styles
- Lightweight

## Installation

Install the package with yarn or npm:

```sh
npm install @universal-labs/styled
# or
yarn add @universal-labs/styled
```

It is ready to use, no need to configure anything else.

## Usage (Styled Components Like API)

### A Primitive RN Component

```ts
import styled from '@universal-labs/styled';

const Button = styled.Pressable``;
```

`styled` returns a new React component with the styles you defined. It works with any component that accepts a `style` prop.

### Universal components with CVA

```ts
import styled from '@universal-labs/styled';
// This component does not have function initialization use as it returns
const Button = styled.Pressable.variants({
  base: 'font-semibold border rounded',
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white border-transparent hover:bg-blue-600',
      // **or**
      // primary: ['bg-blue-500', 'text-white', 'border-transparent', 'hover:bg-blue-600'],
      secondary: 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100',
    },
    size: {
      small: 'text-sm py-1 px-2',
      medium: 'text-base py-2 px-4',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'medium',
  },
});
```

By default, this library support Tailwind CSS classes adapted to mobile styles.

### Own components with CVA like API

```ts
import { Pressable } from 'react-native';
import styled from '@universal-labs/styled';

const Button = styled.Pressable``;

function MyButton({ children, ...props }) {
  return <Button {...props}>{children}</Pressable>;
}
```

## TypeScript

`@universal-labs/styled` is written in TypeScript with complete definitions, so you don't need to install any other packages to use it with TypeScript. Also, it offers a `PropsFrom` helper to extract the props from a component.

```ts
import styled, { PropsFrom } from '@universal-labs/styled';

const Button = styled.Pressable``

type ButtonProps = PropsFrom<typeof Button>;
```

## API Reference

### `styled`

```ts
styled(Component).variants(styles);
```

## Supported units:

Here is a list of the supported units:

- px
- %
- em
- rem
- deg
- vh
- vw
- rad
- turn
- pc
- cn
- ex
- in
- pt
- cm
- mm
- Q

#### Parameters

- `Component` - The component to style.
- `styles` - The styles to apply.
  - `base` - The base styles to apply to the component.
  - `variants` - The variants to apply to the component.
  - `defaultVariants` - The default variants to apply to the component.

## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

Please adhere to this project's `CODE_OF_CONDUCT.md`.

### Credits

- This library is heavily inspired in **nativewind** transforming CSS-to-JS, but without the use of **Babel** or **Tailwind CLI**, instead this lib uses **[Twind](https://twind.style/)** to create CSS and parse as RN StyleSheet at **runtime**
- **Twind** You need to use our styled components or create your own styled components using the styled lib.
- **clsx** is used to concatenate classes in the runtime.
- **Class Variant Authority** Our variants api took many ideas from CVA package, it aims to take those pain points away, allowing you to focus on the more fun aspects of UI development.
