/*jshint esversion: 8*/
require('offline-plugin/runtime').install();

var ajax = require('can-ajax');
require('aframe');
require('aframe-extras');
require('./index.css');

document.addEventListener('DOMContentLoaded', (e)=>{
   var assets = Array.from(document.querySelectorAll('a-asset-item'));
   var images = Array.from(document.querySelectorAll('a-assets img'));
   var sounds = Array.from(document.querySelectorAll('a-assets audio'));
   var videos = Array.from(document.querySelectorAll('a-assets video'));
   var progressBar = document.querySelector('#qProgress');
   var buttonGroup = document.querySelector('#qBtnGrp');
   var scene = document.querySelector('a-scene');

   var totalItems = assets.length+images.length+sounds.length+videos.length;
   var loadedItems = 0;

   progressBar.setAttribute('max','100');

   var loadCompleted = function(){
      progressBar.parentElement.removeChild(progressBar);
      buttonGroup.classList.remove('q-hidden');
   };

   var tallyAsset = async function() {
      loadedItems++;
      var progress = Math.ceil((loadedItems/totalItems)*100);
      progressBar.value=progress;// ('value',progress);

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