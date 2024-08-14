import 'expo/devtools';

declare module 'expo/devtools' {
  interface EventSubscription {
    remove: () => void;
  }
}
