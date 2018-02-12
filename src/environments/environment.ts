export const ENV = {
  name: "Production",
  production: true,
  turnOnDeployment: true,
  security: {
    serverBaseUrl: "https://simpleposapp-dev.azurewebsites.net/identity",
    clientId: "simplepos",
    clientSecret: "21B5F798-BE55-42BC-8AA8-0025B903DC3B",
    grantType: "password",
    scope: "openid",
  },
  ionicDeploy: {
    appId: "22d41469",
    appChannel: "Master"
  },
  appSee: {
    apikey: "4ab58eb9940440b2a77518b94b722bde"
  }
};