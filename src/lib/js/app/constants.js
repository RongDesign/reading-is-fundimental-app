(function(){
  var domain = 'http://literacy-central-dev.shared02.dvinci.com',
      default_files = domain + '/sites/default/files/'

  app.constant('CONFIG', {
    apiBaseUrl: domain + '/api',
    bookCoverBaseUrl: default_files +'Book_Covers/',
    supportMaterialFileBaseUrl: default_files + 'Support_Materials/',
    supportMaterialIconBaseUrl: default_files
  });

  app.constant('ICONS', {
    'activity': 'icon-support-material-activities.png',
    'coloring page': 'icon-support-material-lesson-plan.png',
    'lesson plan': 'icon-support-material-lesson-plan.png',
    'reading passage': 'support-icon-reading-passages.png',
    'vocabulary': 'icon-support-material-video.png'
  });

})();