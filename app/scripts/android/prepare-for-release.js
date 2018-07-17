// copy release signing properties and keystore for android
module.exports = function (ctx) {
  // make sure android platform is part of build
  if (ctx.opts.platforms.indexOf('android') < 0) {
      return;
  }

  var fs = ctx.requireCordovaModule('fs');
  var q = ctx.requireCordovaModule('q');

  function copyFile (file) {
    var defer = q.defer();

    fs.readFile(file.src, function (readErr, readData) {
      if (readErr) {
        defer.reject(readErr);
      } else {
        fs.writeFile(file.dest, readData, function (writeErr, writeData) {
          if (writeErr) {
            defer.reject(writeErr);
          } else {
            defer.resolve(writeData);
          }
        });
      }
    });

    return defer.promise;
  }

  function copyFiles () {
    var defer = q.defer();
    var defers = [];
    var fileProperties = {
      src: 'res/android/release-signing.properties',
      dest: 'platforms/android/release-signing.properties'
    };
    var fileKeystore = {
      src: 'res/android/release.keystore',
      dest: 'platforms/android/release.keystore'
    };

    function onCopySuccess (file) {
      console.log('Successfully copied ' + file.src + ' to ' + file.dest);
    }

    copyFile(fileProperties).then(function () {

      onCopySuccess(fileProperties);
      copyFile(fileKeystore).then(function () {
        onCopySuccess(fileKeystore);
        defer.resolve();
      }, function (err) {
        defer.reject(err);
      });

    }, function (err) {
      defer.reject(err);
    });

    return defer.promise;
  }

  return copyFiles();
};
