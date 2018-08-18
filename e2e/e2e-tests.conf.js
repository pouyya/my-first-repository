// An example configuration file.
exports.config = {
    params: {
        login: {
          username: "t900",
          password: "Admin@1"
        }
      },

    directConnect: true,
  
    // Capabilities to be passed to the webdriver instance.
    capabilities: {
      'browserName': 'chrome'
    },
  
    // Framework to use. Jasmine is recommended.
    framework: 'jasmine',
    baseUrl :"http://localhost:8100/",
    // Spec patterns are relative to the current working directory when
    // protractor is called.
    specs: ['login.tests.ts'],
    allScriptsTimeout: 6000000,

    // Options to be passed to Jasmine.
    jasmineNodeOpts: {
      defaultTimeoutInterval: 30000
    }
  };
  