module.exports = {
   scene: {
      renderer: {
         foveationLevel: 3,
         antialias: true,
         colorManagement: true,
         sortObjects: false,
         physicallyCorrectLights: false,
         maxCanvasWidth: 1920,
         maxCanvasHeight: 1080,
         logarithmicDepthBuffer: 'auto',
         precision: 'high',
         alpha: true,
         highRefreshRate: true
      },
      light: {
         defaultLightsEnabled: false
      },
      shadow: {
         enabled: false,
         autoUpdate: false,
         type: 'pcf'
      },
      background: {
         color: '#FFFFFF',
         transparent: false
      },
      vr_mode_ui: {
         enabled: true,
         enterVRButton: '#qEnterVR',
         enterARButton: '#qEnterAR',
      },
      loading_screen: {
         enabled: false,
      }
   }
};
