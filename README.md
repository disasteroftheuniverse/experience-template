# XR Experience Template

A template for creating XR experiences to deploy on the super-xr app. Easily create VR content with a starter template. Helps redude the amount of code needed to create a functional virtual reality.

# API

## $browseHappy()

Inserts redirect for users using an old browser.

## $player(options)

Add a preset player rig to scene, define controls and interactions.

### Options

*controls* - One of '`gamepad`', '`hands`' or '`keyboard`'. Sets the default input for VR experiences. Hand tracking is not suitable for production usage at this time.

*movement* - One of '`locomote`', '`teleport`' or '`none`'. Sets how player is able to move and navigate a room-scale scene.

### Example

```html
...
<a-entity id="foo"></a-entity>

${$player({
   controls: 'gamepad',
   movement: 'locomate'
})}
```