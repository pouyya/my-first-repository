export const ENV = {
  name: "Development",
  production: false,
  turnOnDeployment: false,
  security: {
    serverBaseUrl: "https://simpleposapp-dev.azurewebsites.net/identity",
    clientId: "simplepos",
    clientSecret: "21B5F798-BE55-42BC-8AA8-0025B903DC3B",
    grantType: "password",
    scope: "openid",
    sessionStorageKey: "jwt-token",
    userSessionStorageKey: "usermedihair_aria",
  },
  ionicDeploy: {
    appId: "22d41469",
    appChannel: "Master"
  }
};