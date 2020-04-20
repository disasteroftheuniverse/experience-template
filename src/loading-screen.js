/*jshint esversion: 8*/
module.exports = document.addEventListener('DOMContentLoaded', (e)=>{
   var assets = Array.from(document.querySelectorAll('a-asset-item'));
   var images = Array.from(document.querySelectorAll('a-assets img'));
   var sounds = Array.from(document.querySelectorAll('a-assets audio'));
   var videos = Array.from(document.querySelectorAll('a-assets video'));
   var progressBar = document.querySelector('#qProgress');
   var buttonGroup = document.querySelector('#qBtnGrp');
   var scene = document.querySelector('a-scene');

   var totalItems = assets.length+images.length+sounds.length+videos.length;
   var loadedItems = 0;

   //progressBar.setAttribute('max','100');

   var loadCompleted = function(){
      progressBar.parentElement.parentElement.removeChild(progressBar.parentElement);
      //progressBar.parentElement.classList.add('q-disappear');
      buttonGroup.classList.remove('q-hidden');
      buttonGroup.classList.add('q-appear');
   };

   var tallyAsset = async function() {
      loadedItems++;
      var progress = Math.ceil((loadedItems/totalItems)*100);
      progressBar.style.width=`${progress}%`;// ('value',progress);

      console.log(`loaded: ${progress}%`);
      console.log(`loaded: ${loadedItems}/${totalItems}`);

      if (loadedItems===totalItems){
         if (scene.renderStarted){
            loadCompleted();
         } else {
            scene.addEventListener('renderstart',loadCompleted,{once: true});
         }
      }
   };

   var onAssetLoad = function(e){
      tallyAsset();
   };

   assets.forEach(asset=>{
      if (asset.loaded){
         tallyAsset();
      } else {
         asset.addEventListener('loaded',onAssetLoad);
      }
   });

   videos.forEach(video=>{
      video.addEventListener('canplay', onAssetLoad);
   });

   images.forEach(image=>{
      image.addEventListener('load', onAssetLoad);
   });

   sounds.forEach(sound=>{
      sound.addEventListener('canplay', onAssetLoad);
   });

   //console.log(assets);
});
