# UNIVERSAL LABS DOCS

## What is it?

React UniversalLabs simplifies the integration of Tailwind CSS framework in React Native hybrid apps. Our main goal is to bridge the gap for React web developers in need to write universal components for native and web. This package allows developers to write Tailwind CSS classes with all states (_active_, _hover_, _focus_) that just works and looks as expected in native. 

Forget looking for which classes are compatible in native and focus on creating wonderful apps.

## Features

- 🍃 **Uses Tailwind** CSS framework
- 🌎 **Universal Design**: Write Tailwind ClassNames and they work in web and native
- ⚡ **Vite**: Enjoy fast compilations
- 🔥 **No Babel dependencies**
- 🔏 **Typescript by default**
- 🎨 **CSS in TS**: Typed CSS
- 💅 **Estados visuales**:  _hover / active / focus_ fully compatible between web and native
- 👪 **Family styles**: Parent component styles affecting children as expeted
- 🤏 **Lightweight**: We parse only the classnames used in your project. No junk.

## In-depth

For the time being, we haven't tested UniversalLabs in React versions prior to 18, or with other CSS frameworks other than TailwindCSS. In theory, this project might work with older react versions and/or other CSS frameworks pre-processed with SASS, and this is something we would love to research and implement in the future.

You can use Universal Labs in an existent project or a new one in any of these ways:

* **Core** With the Core you can create all the componentes you need and use UniversalLab to process your tailwindCSS classes

* **Core & Primitives** Shipped the most basic primitive components every Native App needs. They have no configuration so you can write your own on top of them. They are:
	- [[Image]]
	- [[Nav]]
	- [[Pressable]]
	- Text
	- TextInput
	- View