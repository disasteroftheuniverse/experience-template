/*jshint esversion: 8*/

//var _ = require('lodash');
var shortId = require('shortid');
var url = require('url');

var UserSchema = require('./webpack.userschema');
//var 

module.exports = function (sceneConfig, objectPath, _, 
   mime, randomWords, styleParser, path, 
   assetManifest, compressionExtensionRegex, registerConfiguration) {

   var attrPreset = function (obj, keypath) {
      var key = _.last(keypath.split('.'));
      var propertiesStr = styleParser.stringify(objectPath.get(obj, keypath));
      return propertiesStr; //`${key}="${propertiesStr}"`;
   };

   var registerAsset = function(id,asseturl){
      //var guess = mime.lookup(path.extname(asseturl));
      var isCompressed = compressionExtensionRegex.test(path.parse(asseturl).ext);
      assetManifest[id] = {
         uid: shortId.generate(),
         type: mime.lookup(path.extname(asseturl)),
         url: path.posix.format(path.posix.parse(asseturl)),
         //stuff: path.parse(asseturl),
         compressedURL: (isCompressed) ? asseturl + '.gz' : null,
         compressed: isCompressed,
         extension: path.parse(asseturl).ext,

      };
      return assetManifest[id];
   };

   var templates = {
      $noscript:`
         <noscript>Please Enable Javascript</noscript>
      `,
      $fonts:`
      <style>@import url(https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap);@import url(https://fonts.googleapis.com/css2?family=Share+Tech&family=Share+Tech+Mono&display=swap);</style>
      `,
      $browseHappy: `
      <!--[if lt IE 7]>
         <p class="browsehappy">
            You are using an <strong>outdated</strong> browser. Please <a href="https://mozilla.org">upgrade your browser</a> to improve your experience.
         </p>
      <![endif]-->`,
      $loadOverlay: `
      <style>.q-hidden{display:none}.q-button-group{opacity:0;z-index:112}.q-load-overlay{position:absolute;top:0;left:0;z-index:110;width:100%;height:100%;background-color:#333}.q-spinner-position{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);padding:0;margin:0}.q-button-position{position:absolute;bottom:1%;right:1%;padding:0;margin:20px}.q-enter-vr-button{cursor:default;line-height:25px;font-family:'Share Tech',sans-serif;font-size:24px;font-weight:lighter;text-align:center;letter-spacing:.5px;vertical-align:middle;padding:12px 48px 12px 48px;border-style:none;border-radius:5px;background-color:orange;color:#000}.q-enter-vr-button:hover{cursor:pointer;border-style:solid;border-width:3px;color:#fff;border-color:#fff}.q-close-modal-button{cursor:default;font-size:32px;position:absolute;top:16px;right:16px;color:#fff;opacity:.5}.q-close-modal-button:hover{cursor:pointer;opacity:.9;top:15px}.q-prog-bg{display:inline-block;width:500px;height:18px;background-color:#444;border-radius:0;overflow:hidden;padding:0;margin:0;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:1;z-index:112}.q-prog-bar{background:repeat linear-gradient(45deg,#ffc457 25%,#ffa938 25%,#ffa938 50%,#ffc457 50%,#ffc457 75%,#ffa938 75%);background-size:50px 50px;background-position:0;height:100%;width:0%;padding:0;margin:0;animation:q-progress-twizzle 1s linear infinite}.q-appear{animation:q-button-appear 1s ease-in-out;opacity:1}@keyframes q-progress-twizzle{from{background-position:0}to{background-position:50px}}@keyframes q-button-appear{from{opacity:0}to{opacity:1}}</style>
      <div class="q-load-overlay">
         <a class="q-close-modal-button" id="q-close-modal">⨉</a>
         <div class="q-spinner-position">
            <div class="q-prog-bg">
               <div id="qProgress" class="q-prog-bar"></div>
            </div>
         </div>

      </div>
      <div class="q-spinner-position q-button-group q-hidden" id="qBtnGrp">
         <a class="q-enter-vr-button" id="qEnterVR">Enter VR</a>
         <a class="q-enter-vr-button q-hidden" id="qEnterAR">Enter AR</a>
      </div>

      <script>
         document.querySelector("#q-close-modal").addEventListener("click",e=>{document.querySelector(".q-load-overlay").style.display="none";var btnGRP=document.querySelector("#qBtnGrp");btnGRP.classList.remove("q-spinner-position"),btnGRP.classList.add("q-button-position")});
      </script>
      
      `,
      $oldIE: {
         start: `<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
         <!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
         <!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
         <!--[if gt IE 8]><!-->`,
         end: `<!--<![endif]-->`
      },
      $foo :'',
      $preset: function (prop) {
         return attrPreset(sceneConfig, prop);
      },
      $uid: function () {
         var sid = shortId.generate();
         return sid;
      },
      $asset: function (id, asseturl, use) {
         var guess = registerAsset(id, asseturl);
         var assetTag = `<a-asset-item id="${id}" src="${asseturl}" type="${guess.type}" data-uuid="${guess.uid}"></a-asset-item>`;
         if (use && use==='false') {
            return `<!-- ${assetTag} -->`;
         } else {
            return assetTag;
         }
         
      },
      $video: function (id, asseturl, use) {
         var guess = registerAsset(id, asseturl);
         var assetTag = `<video id="${id}" src="${asseturl}" type="${guess.type}" playsinline webkit-playsinline crossorigin="anonymous" data-uuid="${guess.uid}"></video>`;
         if (use && use==='false') {
            return `<!-- ${assetTag} -->`;
         } else {
            return assetTag;
         }
         
      },
      $audio: function (id, asseturl, use){
         var guess = registerAsset(id, asseturl);
         var assetTag =  `<audio id="${id}" src="${asseturl}" type="${guess.type}" playsinline webkit-playsinline crossorigin="anonymous" data-uuid="${guess.uid}"></audio>`;

         if (use && use==='false') {
            return `<!-- ${assetTag} -->`;
         } else {
            return assetTag;
         }
      },
      $img: function (id, asseturl, use){
         var guess = registerAsset(id, asseturl);
         var assetTag =  `<img id="${id}" src="${asseturl}" type="${guess.type}" alt="virtual realty 3D texture" data-uuid="${guess.uid}" />`;

         if (use && use==='false') {
            return `<!-- ${assetTag} -->`;
         } else {
            return assetTag;
         }
      },
      $config: {
         enum: (name, list) =>{
            var option = new UserSchema.Enum(name,list);
            registerConfiguration(name,option);
            return '${' + name + '}';
         },
         toggle: (name, value) =>{
            var option = new UserSchema.Toggle(name,value);
            registerConfiguration(name,option);
            return '${' + name + '}';
         },
         msg: (name, value) =>{
            var option = new UserSchema.Msg(name,value);
            registerConfiguration(name,option);
            return '${' + name + '}';
         },
         asset: (name, list) =>{
            var option = new UserSchema.Enum(name,list);
            registerConfiguration(name,option);
            return '${' + name + '}';
         },
      }
   };
   return templates;
};