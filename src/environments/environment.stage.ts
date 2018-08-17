export const ENV = {
  name: "Stage",
  production: true,
  turnOnDeployment: true,
  webapp: {
    baseUrl: "https://webapp-dev.pos.app",
    inventoryReportUrl: "/v1/api/reports/inventory"
  },  
  service: {
    baseUrl: "https://site-stage.pos.app"
  },
  security: {
    serverUrl: "https://site-stage.pos.app"
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