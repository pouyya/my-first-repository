export const ENV = {
  name: "Production",
  production: true,
  turnOnDeployment: true,
  webapp: {
    baseUrl: "https://webapp-dev.pos.app",
    inventoryReportUrl: "/v1/api/reports/inventory"
  },
  service: {
    baseUrl: "https://site.pos.app"
  },
  security: {
    serverUrl: "https://site.pos.app"
  },
  ionicDeploy: {
    appId: "22d41469",
    appChannel: "Production"
  },
  appSee: {
    apikey: "4ab58eb9940440b2a77518b94b722bde"
  }
}; 