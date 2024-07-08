import React from 'react';

if (process.env['NODE_ENV'] === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  // whyDidYouRender.default(React,{

  // })
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
  });
}
