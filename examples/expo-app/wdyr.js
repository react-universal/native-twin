import React from 'react';
import whyDidYouRender from '@welldone-software/why-did-you-render';

if (__DEV__) {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
  });
  console.log('WDYR ENABLED !');
}
