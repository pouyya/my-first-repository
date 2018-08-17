export const ENV = {
  name: "Development",
  production: false,
  turnOnDeployment: false,
  webapp: {
    baseUrl: "https://webapp-dev.pos.app",
    inventoryReportUrl: "/v1/api/reports/inventory"
  },
  service: {
    baseUrl: "https://site-dev.pos.app"
  },
  security: {
    serverUrl: "http://localhost:5000" //https://site-dev.pos.app"
  },
  ionicDeploy: {
    appId: "22d41469",
    appChannel: "Master"
  },
  appSee: {
    apikey: "4ab58eb9940440b2a77518b94b722bde"
  },
  pingInterval: 5 * 60 *1000
};