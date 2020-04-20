# XR Experience Template

A template for creating XR experiences to deploy on the super-xr app. Easily create VR content with a starter template. Helps redude the amount of code needed to create a functional virtual reality. 

Listed below are methods which can be entered in the **index.html** document which insert prescribed templates. You may also create your own templates in **templates.js.**


## $img

```js
${$img(id,require( path ))}
```
* **id** - the desired id of the html image element, must be unique.
* **path** - the path to the image you want to include.

Imports an image and saves it into the `/assets/images/` directory. Supports JPG and PNG. 

## $video

```js
${$video(id,require( path ))}
```
* **id** - the desired id of the html video element, must be unique.
* **path** - the path to the video you want to include.

Imports an image and saves it into the `/assets/video/` directory. Supports mp4 and WEBM. 

## $audio

```js
${$audio(id,require( path ))}
```
* **id** - the desired id of the html audio element, must be unique.
* **path** - the path to the audio you want to include.

Imports an image and saves it into the `/assets/audio/` directory. Supports mp3 and ogg.