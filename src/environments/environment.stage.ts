export const ENV = {
  name: "Stage",
  production: true,
  turnOnDeployment: true,
  webapp: {
    baseUrl: "https://webapp-stage.pos.app",
    inventoryReportUrl: "/v1/api/reports/inventory",
    salesReportUrl: "/v1/api/reports/salessummary",
    staffAttendanceReportUrl: "/v1/api/reports/staffattendance"
  },
  service: {
    baseUrl: "https://site-stage.pos.app"
  },
  security: {
    serverUrl: "https://site-stage.pos.app"
  },
  ionicDeploy: {
    appId: "22d41469",
    appChannel: "Stage"
  },
  appSee: {
    apikey: "4ab58eb9940440b2a77518b94b722bde"
  }
};