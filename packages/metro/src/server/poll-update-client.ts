const url = require('react-native/Libraries/Core/Devtools/getDevServer')().url;

const debugPoolServer = (...args: (string | number)[]) => {
  console.debug('POOL_SERVER: ', ...args, '\n');
};

async function pollServer(version = 1) {
  try {
    const twinURL = `${url}__native_twin_update_endpoint?version=${version}`;
    debugPoolServer('URL', twinURL);
    const response = await fetch(twinURL);
    debugPoolServer('CLIENT_BUNDLER_PROCESS: ', process.pid);

    if (!response.ok) {
      debugPoolServer(
        'ERROR',
        'There was a problem connecting to the native-twin Metro server',
      );
    }

    const body = await response.text();
    debugPoolServer('RESPONSE_TEXT', body);

    if (body.startsWith('data: ')) {
      debugPoolServer('BODY_START_WITH: data: ');
      const data = JSON.parse(body.replace('data: ', ''));
      debugPoolServer('WRITE_INCOMING_VERSION', data.version);
      version = data.version;
    }

    debugPoolServer('NEXT_VERSION: ', version);

    return pollServer(version);
  } catch (error: any) {}
}

pollServer();
