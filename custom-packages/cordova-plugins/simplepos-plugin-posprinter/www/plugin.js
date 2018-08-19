var exec = require('cordova/exec');

var PLUGIN_NAME = 'posprinter';

var posprinter = {

  startDiscover: function () {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'startDiscover', []);
    });
  },
  stopDiscover: function () {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'stopDiscover', []);
    });
  },
  connectPrinter: function (type, ipAddress) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'connectPrinter', [type, ipAddress]);
    });
  },
  disconnectPrinter: function () {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'disconnectPrinter', []);
    });
  },
  addText: function (data) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'addText', [data]);
    });
  },
  addTextAlign: function (align) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'addTextAlign', [align]);
    });
  },
  addTextSize: function (width, height) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'addTextSize', [width, height]);
    });
  },
  addFeedLine: function (line) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'addFeedLine', [line]);
    });
  },
  addBarcode: function (data, type, hri, font, width, height) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'addBarcode', [data, type, hri, font, width, height]);
    });
  },
  addCut: function (type) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'addCut', [type]);
    });
  },
  addTextStyle: function (reverse, ul, em, color) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'addTextStyle', [reverse, ul, em, color]);
    });
  },
  addPulse: function (drawer, time) {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'addPulse', [drawer, time]);
    });
  },
  print: function () {
    return new Promise(function (successCallback, errorCallback) {
      exec(successCallback, errorCallback, PLUGIN_NAME, 'print');
    });
  },
};

module.exports = posprinter;