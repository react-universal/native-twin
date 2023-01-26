# Universal React Native + Web + Tailwindcss

## Bit

You need to install Bit to compile the design system.

- `npx @teambit/bvm install`
- `bit import`
- `bit compile showtime.universal/extensions/react-native-web && bit link`
- `bit compile && bit link`

While you are developing, you can use the `bit watch` command to watch for changes.

Then if you want to publish a new version you can run:

- `bit tag --force-deploy`
- `bit export`

Then you can install the new version of the packages in `apps/expo/package.json`:

- `yarn up '@react-universal/nativewind.*'`
  or
- `yarn upgrade:design-system` if you are working in the Showtime monorepo.