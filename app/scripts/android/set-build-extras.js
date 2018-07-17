// work-around for https://issues.apache.org/jira/browse/CB-8976
// explicitly set android version code in gradle build extras (from package.json)
module.exports = function (ctx) {
  // make sure android platform is part of build
  if (ctx.opts.platforms.indexOf('android') < 0) {
      return;
  }

  var fs = ctx.requireCordovaModule('fs');
  var deferral = ctx.requireCordovaModule('q').defer();
  var pkg = require('../../../package.json');
  var gradleBuildExtrasLocation = 'platforms/android/build-extras.gradle';
  var cdvVersionCode;

  if (pkg && pkg.config && pkg.config.cordova && pkg.config.cordova.version) {
    cdvVersionCode = pkg.config.cordova.version.code;
  }

  if (!cdvVersionCode) {
    deferral.reject('Problem parsing version code from package.json');
  }

  fs.writeFile(gradleBuildExtrasLocation, 'ext.cdvVersionCode=' + cdvVersionCode, function (err, stats) {
    if (err) {
      deferral.reject('Problem writing to ' + gradleBuildExtrasLocation);
    } else {
      console.log('Successfully updated cdvVersionCode (' + cdvVersionCode + ') in ' + gradleBuildExtrasLocation);
      deferral.resolve();
    }
  });

  return deferral.promise;
};
