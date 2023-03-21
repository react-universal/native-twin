# Expo / React Native CLI

## 1. Create a new project project

```
npx create-expo-app my-app
cd my-app
```

You need to install @universal-labs/primitives and it's peer dependency tailwindcss.

```
yarn add @universal-labs/primitives
yarn add -D tailwindcss
```


### 2. Setup Tailwind CSS

Run `npx tailwindcss init` to create a `tailwind.config.js` file Add the paths to all of your component files in your tailwind.config.js file. Remember to replace `<custom directory>` with the actual name of your directory e.g. `screens`.

### 3. Thats it! 🎊

Start using tailwindcss!

```JSX
// MyComponent
<View>
	<div class="rounded-lg bg-slate-600 text-white"> Hello world </div>
</View>
```