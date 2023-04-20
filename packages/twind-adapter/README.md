# @universal-labs/core

Put a description of your Unimodule here

# API documentation

- [Documentation for the main branch](https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk)
- [Documentation for the latest stable release](https://docs.expo.dev/versions/latest/sdk/)

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/versions/latest/introduction/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](#api-documentation). If you follow the link and there is no documentation available then this library is not yet usable within managed projects &mdash; it is likely to be included in an upcoming Expo SDK release.

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npm install @universal-labs/core
```

# Supported Utilities

- ✅ = Implemented
- 🚨 = No tailwindcss equivalent, not implemented

|                         Utility                         | WEB | IOS | ANDROID |
| :-----------------------------------------------------: | :-: | :-: | :-----: |
|                      alignContent                       | ✅  | ✅  |   ✅    |
|                       alignItems                        | ✅  | ✅  |   ✅    |
|                        alignSelf                        | ✅  | ✅  |   ✅    |
|                       aspectRatio                       | ✅  | ✅  |   ✅    |
|                   backfaceVisibility                    | ✅  | ✅  |   ✅    |
|                     backgroundColor                     | ✅  | ✅  |   ✅    |
|                    borderBottomWidth                    | ✅  | ✅  |   ✅    |
|                    borderBottomColor                    | ✅  | ✅  |   ✅    |
|                  borderBottomEndRadius                  | ✅  | ✅  |   ✅    |
|                 borderBottomLeftRadius                  | ✅  | ✅  |   ✅    |
|                 borderBottomRightRadius                 | ✅  | ✅  |   ✅    |
|                 borderBottomStartRadius                 | ✅  | ✅  |   ✅    |
|                       borderColor                       | ✅  | ✅  |   ✅    |
|                     borderEndColor                      | ✅  | ✅  |   ✅    |
|                     borderEndWidth                      | ✅  | ✅  |   ✅    |
|                     borderLeftColor                     | ✅  | ✅  |   ✅    |
|                     borderLeftWidth                     | ✅  | ✅  |   ✅    |
|                      borderRadius                       | ✅  | ✅  |   ✅    |
|                    borderRightColor                     | ✅  | ✅  |   ✅    |
|                    borderRightWidth                     | ✅  | ✅  |   ✅    |
|                    borderStartColor                     | ✅  | ✅  |   ✅    |
|                    borderStartWidth                     | ✅  | ✅  |   ✅    |
|                       borderStyle                       | ✅  | ✅  |   ✅    |
|                     borderTopColor                      | ✅  | ✅  |   ✅    |
|                   borderTopEndRadius                    | ✅  | ✅  |   ✅    |
|                   borderTopLeftRadius                   | ✅  | ✅  |   ✅    |
|                  borderTopRightRadius                   | ✅  | ✅  |   ✅    |
|                  borderTopStartRadius                   | ✅  | ✅  |   ✅    |
|                     borderTopWidth                      | ✅  | ✅  |   ✅    |
|                       borderWidth                       | ✅  | ✅  |   ✅    |
|                         bottom                          | ✅  | ✅  |   ✅    |
|                          color                          | ✅  | ✅  |   ✅    |
|                        columnGap                        | ✅  | ✅  |   ✅    |
|                        direction                        | ✅  | ✅  |   ✅    |
|                         display                         | ✅  | ✅  |   ✅    |
|                elevation (android-only)                 | ✅  | ✅  |   ✅    |
|                           end                           | ✅  | ✅  |   ✅    |
| flex (RN implementation does not match web/tailwindcss) | ✅  | ✅  |   ✅    |
|                      flexDirection                      | ✅  | ✅  |   ✅    |
|                        flexBasis                        | ✅  | ✅  |   ✅    |
|                        flexGrow                         | ✅  | ✅  |   ✅    |
|                       flexShrink                        | ✅  | ✅  |   ✅    |
|                        flexWrap                         | ✅  | ✅  |   ✅    |
|                       fontFamily                        | ✅  | ✅  |   ✅    |
|                        fontSize                         | ✅  | ✅  |   ✅    |
|                        fontStyle                        | ✅  | ✅  |   ✅    |
|                       fontVariant                       | ✅  | ✅  |   ✅    |
|                       fontWeight                        | ✅  | ✅  |   ✅    |
|                           gap                           | ✅  | ✅  |   ✅    |
|                         height                          | ✅  | ✅  |   ✅    |
|                   includeFontPadding                    | ✅  | ✅  |   ✅    |
|                     justifyContent                      | ✅  | ✅  |   ✅    |
|                          left                           | ✅  | ✅  |   ✅    |
|                      letterSpacing                      | ✅  | ✅  |   ✅    |
|                       lineHeight                        | ✅  | ✅  |   ✅    |
|                         margin                          | ✅  | ✅  |   ✅    |
|                      marginBottom                       | ✅  | ✅  |   ✅    |
|                        marginEnd                        | ✅  | ✅  |   ✅    |
|                    marginHorizontal                     | ✅  | ✅  |   ✅    |
|                       marginLeft                        | ✅  | ✅  |   ✅    |
|                       marginRight                       | ✅  | ✅  |   ✅    |
|                       marginStart                       | ✅  | ✅  |   ✅    |
|                        marginTop                        | ✅  | ✅  |   ✅    |
|                     marginVertical                      | ✅  | ✅  |   ✅    |
|                        maxHeight                        | ✅  | ✅  |   ✅    |
|                        maxWidth                         | ✅  | ✅  |   ✅    |
|                        minHeight                        | ✅  | ✅  |   ✅    |
|                        minWidth                         | ✅  | ✅  |   ✅    |
|                         opacity                         | ✅  | ✅  |   ✅    |
|                        overflow                         | ✅  | ✅  |   ✅    |
|               overlayColor (android only)               | ✅  | ✅  |   ✅    |
|                         padding                         | ✅  | ✅  |   ✅    |
|                      paddingBottom                      | ✅  | ✅  |   ✅    |
|                       paddingEnd                        | ✅  | ✅  |   ✅    |
|                    paddingHorizontal                    | ✅  | ✅  |   ✅    |
|                       paddingLeft                       | ✅  | ✅  |   ✅    |
|                      paddingRight                       | ✅  | ✅  |   ✅    |
|                      paddingStart                       | ✅  | ✅  |   ✅    |
|                       paddingTop                        | ✅  | ✅  |   ✅    |
|                     paddingVertical                     | ✅  | ✅  |   ✅    |
|                        position                         | ✅  | ✅  |   ✅    |
|                       resizeMode                        | ✅  | ✅  |   ✅    |
|                          right                          | ✅  | ✅  |   ✅    |
|                         rowGap                          | ✅  | ✅  |   ✅    |
|                       shadowColor                       | ✅  | ✅  |   ✅    |
|                      shadowOffset                       | ✅  | ✅  |   ✅    |
|                      shadowOpacity                      | ✅  | ✅  |   ✅    |
|                      shadowRadius                       | ✅  | ✅  |   ✅    |
|                          start                          | ✅  | ✅  |   ✅    |
|                        textAlign                        | ✅  | ✅  |   ✅    |
|                    textAlignVertical                    | ✅  | ✅  |   ✅    |
|                   textDecorationColor                   | ✅  | ✅  |   ✅    |
|                   textDecorationLine                    | ✅  | ✅  |   ✅    |
|                   textDecorationStyle                   | ✅  | ✅  |   ✅    |
|                     textShadowColor                     | ✅  | ✅  |   ✅    |
|                    textShadowOffset                     | ✅  | ✅  |   ✅    |
|                    textShadowRadius                     | ✅  | ✅  |   ✅    |
|                      textTransform                      | ✅  | ✅  |   ✅    |
|                        tintColor                        | ✅  | ✅  |   ✅    |
|                           top                           | ✅  | ✅  |   ✅    |
|                          width                          | ✅  | ✅  |   ✅    |
|                    writingDirection                     | ✅  | ✅  |   ✅    |
|                         zIndex                          | ✅  | ✅  |   ✅    |

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide](https://github.com/expo/expo#contributing).
