export const ENV = {
  name: "Stage",
  production: true,
  turnOnDeployment: true,
  webapp: {
    baseUrl: "https://webapp-dev.pos.app",
    inventoryReportUrl: "/v1/api/reports/inventory"
  },
  dotNetApp: {
    baseUrl: "http://localhost:5000",
    salesReportUrl: "/v1/api/reports/dashboard"
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
  }
};