module.exports = (wallaby) => {
  return {
    reportConsoleErrorAsError: true,
    autoDetect: ["vitest"],
    trace: false,
    runMode: 'onsave',
    runAllTestsInAffectedTestFile: true,
    // runAllTestsWhenNoAffectedTests: false,
    resolveGetters: true,
    ignoreFileLoadingDependencyTracking: true,
    // mapConsoleMessagesStackTrace: true,
    logLimits: {
      inline: {
        // The depth to log for values displayed inline beside your code
        depth: 100,

        // The maximum number of elements to log for values displayed
        // inline beside your code
        elements: 5000,
      },
      values: {
        default: {
          // The string length at which strings are truncated within
          // Log messages
          stringLength: 8192,
        },
        autoExpand: {
          // The string length at which strings are truncated when
          // using the auto-expand feature
          stringLength: 8192,

          // The maximum number of elements to log for values displayed
          // using the auto-expand feature
          elements: 5000,

          // The maximum depth to log for values displayed using the
          // auto-expand feature
          depth: 100,
        }
      },
    }
  };
};
