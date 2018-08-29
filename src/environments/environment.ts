export const ENV = {
  name: "Production",
  production: true,
  turnOnDeployment: true,
  webapp: {
    baseUrl: "https://webapp.pos.app",
    inventoryReportUrl: "/v1/api/reports/inventory",
    salesReportUrl: "/v1/api/reports/salessummary",
    staffAttendanceReportUrl: "/v1/api/reports/staffattendance"
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
  },
  pingInterval: 5 * 60 *1000
}; 