const url = require('react-native/Libraries/Core/Devtools/getDevServer')().url;

async function pollServer(version = 1) {
  try {
    const response = await fetch(`${url}__native_twin_update_endpoint?version=${version}`);
    if (!response.ok) {
      console.error('There was a problem connecting to the native-twin Metro server');
    }

    const body = await response.text();

    if (body.startsWith('data: ')) {
      const data = JSON.parse(body.replace('data: ', ''));
      console.log('WRITE_INCOMING_VERSION: ', data.version);
      version = data.version;

      // StyleSheet.registerCompiled({
      //   $$compiled: true,
      //   ...data.data,
      // });
    }

    console.log('POOL_SERVER', version);

    return pollServer(version);
  } catch (error: any) {}
}

pollServer();
