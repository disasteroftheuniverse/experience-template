/*jshint esversion: 8*/
const path = require('path');
module.exports = function (url, resourcePath, context) {
   var ext = path.parse(resourcePath).ext;
   var subdir = 'other';
   switch (ext) {
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
         subdir='images';
         break;
      case '.glb':
      case '.gltf':
      case '.bin':
      case '.obj':
      case '.fbx':
         subdir='models';
         break;
      case '.wav':
      case '.mp3':
         subdir='audio';
         break;
      case '.mp4':
         subdir='video';
         break;
      default:
         subdir='other';
   }
   return `./assets/${subdir}/${url}`;
};