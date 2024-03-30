import { METRO_ENDPOINT } from './constants';

const url = require('react-native/Libraries/Core/Devtools/getDevServer')().url;

async function pollServer(version = 1) {
  try {
    const response = await fetch(`${url}${METRO_ENDPOINT}?version=${version}`);
    if (!response.ok) {
      console.error(
        'There was a problem connecting to the react-native-css-interop Metro server',
      );
    }

    const body = await response.text();

    if (body.startsWith('data: ')) {
      const data = JSON.parse(body.replace('data: ', ''));
      version = data.version;

      // StyleSheet.registerCompiled({
      //   $$compiled: true,
      //   ...data.data,
      // });
    }

    return pollServer(version);
  } catch (error: any) {}
}

pollServer();
