var chalk = require("chalk");
var fs = require('fs');
var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

var env = process.env.SP_ENV || 'dev';

useDefaultConfig.prod.resolve.alias = {
  "@app/env": path.resolve(environmentPath('prod'))
};

useDefaultConfig.dev.resolve.alias = {
  "@app/env": env == 'stage' ? path.resolve(environmentPath('stage')) : path.resolve(environmentPath('dev'))
};

if (env !== 'prod' && env !== 'dev' && env !== 'stage') {
  // Default to dev config
  useDefaultConfig[env] = useDefaultConfig.dev;
  useDefaultConfig[env].resolve.alias = {
    "@app/env": path.resolve(environmentPath(env))
  };
}

function environmentPath(env) {
  var filePath = './src/environments/environment' + (env === 'prod' ? '' : '.' + env) + '.ts';
  console.log(filePath);
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red('\n' + filePath + ' does not exist!'));
  } else {
    return filePath;
  }
}

module.exports = function () {
  return useDefaultConfig;
};