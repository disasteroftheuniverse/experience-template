/*jshint esversion: 8*/

//var _ = require('lodash');

module.exports = function (sceneConfig, objectPath, _, mime, randomWords, styleParser, path) {

   var attrPreset = function (obj, keypath) {
      var key = _.last(keypath.split('.'));
      var propertiesStr = styleParser.stringify(objectPath.get(obj, keypath));
      return propertiesStr; //`${key}="${propertiesStr}"`;
   };

   var templates = {
      $browseHappy: `
      <!--[if lt IE 7]>
         <p class="browsehappy">
            You are using an <strong>outdated</strong> browser. Please <a href="https://mozilla.org">upgrade your browser</a> to improve your experience.
         </p>
      <![endif]-->`,
      $loadOverlay: `
      <div class="q-load-overlay">
         <a class="q-close-modal-button" id="q-close-modal">⨉</a>
         <script>
            document.querySelector('#q-close-modal').addEventListener('click', (e)=>{
               document.querySelector('.q-load-overlay').style.display='none';
            });
         </script>
         <div class="q-spinner-position">
            <progress id="qProgress" class="q-loading" max="100" value="0"></progress>
            <div class="q-button-group q-hidden" id="qBtnGrp">
               <a class="q-enter-vr-button" id="qEnterVR">Enter VR</a>
               <a class="q-enter-vr-button q-hidden" id="qEnterAR">Enter AR</a>
            </div>
         </div>
      </div>`,
      $oldIE: {
         start: `<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
         <!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
         <!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
         <!--[if gt IE 8]><!-->`,
         end: `<!--<![endif]-->`
      },
      $preset: function (prop) {
         return attrPreset(sceneConfig, prop);
      },
      $asset: function (id, asseturl) {
         return `<a-asset-item id="${id}" src="${asseturl}"></a-asset-item>`;
      },
      $video: function (id, asseturl) {
         var guess = mime.lookup(path.extname(asseturl));
         console.log(guess);
         return `<video id="${id}" src="${asseturl}" type="${guess}" playsinline webkit-playsinline crossorigin="anonymous"></video>`;
      },
      $audio: function (id, asseturl) {
         var guess = mime.lookup(path.extname(asseturl));
         console.log(guess);
         return `<audio id="${id}" src="${asseturl}" type="${guess}" playsinline webkit-playsinline crossorigin="anonymous"></audio>`;
      },
      $img: function (id, asseturl) {
         var altext = randomWords({
            exactly: 1,
            wordsPerString: 5,
            separator: ' '
         }); 
         return `<img id="${id}" src="${asseturl}" alt="${altext}" />`;
      }
   };
   return templates;
};