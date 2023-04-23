<div align="center">
  <p align="center">
    <a href="https://tailwind-docs.vercel.app/" target="_blank">
      <img src="./assets/react-universal-tailwind-logo.png" alt="React Universal Tailwind Logo" width="70" height="70">
      <h1 align="center" style="color:red;">React Universal Tailwind</h1>
    </a>
      <p>React UniversalLabs simplifies the integration of Tailwind CSS framework in React Native hybrid apps. Our main goal is to bridge the gap for React web developers in need to write universal components for native and web. <br/> 
      This package allows developers to write Tailwind CSS classes with all states (active, hover, focus) that just works and looks as expected in native.</p>
      <h4 align="center" style="color:red;">This is a work in progress, not ready for production.</h4>
  </p>
  <img alt="GitHub main branch checks state" src="https://img.shields.io/github/checks-status/react-universal/tailwind/main">
  <a href="http://commitizen.github.io/cz-cli/" target="_blank">
    <img alt="Commitizen friendly" src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg">
  </a>
  <a href="https://www.npmjs.com/package/@universal-labs/primitives" target="_blank">
    <img alt="npm version" src="https://img.shields.io/npm/v/@universal-labs/primitives">
    <img alt="npm downloads" src="https://img.shields.io/npm/dt/@universal-labs/primitives">
  </a>
  <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/react-universal/tailwind">
  <img alt="GitHub" src="https://img.shields.io/github/license/react-universal/tailwind">
</div>
<br />

This library is heavily inspired in **nativewind** transforming CSS-to-JS, but without the use of **Babel** or **Tailwind CLI**, instead this lib uses **[Tailwind CSS](https://tailwindcss.com/)** itself and **[PostCSS](https://postcss.org/)** in the runtime. 

**PostCSS** runs only on react-native Tailwind is bundled into the core package (this idea was readapted from **tw-to-css** lib), for web we uses **[Tailwind CSS](https://tailwindcss.com/)** and **[PostCSS](https://postcss.org/)** just like any react project, but you need to use our styled components or create your own styled components using the styled lib.

### React Native + Web + Tailwind CSS = 💥 React Universal Tailwind 💥

## Features

- Uses Tailwind CSS in React Native.
- Universal Design.
- Fast compilations with **Vite**.
- No Babel dependencies.
- **TypeScript** by default.
- CSS in TS.
- Visual States (*hover, active, focus*)
- Family styles
- Lightweight


## Documentation

[https://tailwind-docs.vercel.app/](https://tailwind-docs.vercel.app/)


## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

Please adhere to this project's `code of conduct`.


> ⚠ Warning: This is a work in progress, not ready for production.
>
> This library has been tested using react 18 and expo 48.
