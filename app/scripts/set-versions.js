#!/usr/bin/env node

/*
  after_prepare hook to find/replace text in files
*/

module.exports = function (context) {
  var fs = require('fs');
  var path = require('path');
  var pkg = require('../../package.json');

  var rootdir;
  var platforms;
  var config;

  if (!(context && context.opts && context.opts.projectRoot && context.opts.platforms)) {
    console.error('Error: Unable to parse root directory / environment variables');
    return;
  }

  rootdir = context.opts.projectRoot;

  if (!rootdir) {
    return;
  }

  platforms = context.opts.platforms;

  if (!platforms || !platforms.length) {
    console.error('Error: No platforms specified');
    return;
  }

  function replaceInFile (filename, search, replace) {
    var data = fs.readFileSync(filename, 'utf8');
    var result = data.replace(new RegExp(search, 'g'), replace);

    fs.writeFileSync(filename, result, 'utf8');
  }

  function readConfig (filename) {
    var file = fs.readFileSync(filename, 'utf8');

    if (!file) {
      return;
    }

    return JSON.parse(file);
  }

  // read the config object from config.json
  config = readConfig(path.join(rootdir, 'config.json'));

  if (!config) {
    console.error('Error: Unable to parse config.json');
    return;
  }

  function searchReplace (platform, platformconfig) {
    if (platform) {
      console.log('Platform found (' + platform + '), attempting to search/replace in files');
    }

    if (platformconfig && platformconfig.files) {
      platformconfig.files.forEach(function (file) {
        var fullfilename = path.join(rootdir, file.filename);

        if (fs.existsSync(fullfilename)) {
          console.log('Replacing values in ' + fullfilename);
          file.searchreplace.forEach(function (replace) {
            // replace constants
            replace.value = replace.value.replace('[APP_NAME]', pkg.description);

            // replace in file
            replaceInFile(fullfilename, replace.key, replace.value);
          });
        } else {
          console.error('File ' + file + ' does not exist, unable to search/replace');
        }
      });
    }
  }

  function sprintf (str, replacements) {
    for (var i = 0, ii = replacements.length; i < ii; ++i) {
      str = str.replace(new RegExp('%'+i, 'g'), replacements[i]);
    }
    return str;
  }

  function setVersionNumbers (platform) {
    var version;
    var value;
    var www;

    if (pkg && pkg.config && pkg.config.cordova) {
      version = pkg.config.cordova.version;

      if (platform === 'android') {
        www = 'platforms/android/assets/www';
      } else if (platform === 'ios') {
        www = 'platforms/ios/www';
      }

      searchReplace(platform, {
        files: [
          {
            filename: 'config.xml',
            searchreplace: [
              {
                key: 'version="X"',
                value: sprintf('version="%0" ios-CFBundleVersion="%1" android-versionName="%0" android-versionCode="%1"', [ version.name, version.code ])
              }
            ]
          },
          {
            filename: www + '/index.html',
            searchreplace: [
              {
                key: 'window.env = {};',
                value: sprintf('window.env = { version: \'%0\', platform: \'%1\' }', [ version.name, version.code ])
              }
            ]
          }
        ]
      });
    }
  }

  // loop through all platforms and replace key/value in files array
  platforms.forEach(function (platform) {
    if (!platform) {
      return;
    }

    // search/replace
    searchReplace(platform, config[platform]);

    // set version numbers
    setVersionNumbers(platform);
  });

};
