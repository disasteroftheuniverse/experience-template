/*jshint esversion: 8*/
const path = require('path');
const slash = require('slash');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {
   CleanWebpackPlugin
} = require('clean-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

var styleParser = require('aframe/src/utils/styleParser');
var objectPath = require('object-path');
var _ = require('lodash');

var XMLParser = require('xml2json');
var fs = require('fs');
const fsExtra = require('fs-extra');

var htmlPresets = require('./presets');

const protocolify = require('protocolify');
const gltfPipeline = require('gltf-pipeline');
const gltfToGlb = gltfPipeline.gltfToGlb;
const processGltf = gltfPipeline.processGltf;

var attrPreset = function (obj, keypath) {
   var keys = keypath.split('.');
   var key = _.last(keys);

   var propertiesObj = objectPath.get(obj, keypath);
   var propertiesStr = styleParser.stringify(propertiesObj);

   var attr = `${key}="${propertiesStr}"`;
   console.log(attr);
   return attr;
};

var rawConfig = JSON.parse(XMLParser.toJson(fs.readFileSync(path.resolve(__dirname, './../scene.config.xml'), {
   encoding: 'utf-8'
})));
var sceneConfig = rawConfig.presets;

var htmlTemplateParameters =  {
   $browseHappy: htmlPresets.browserHappy,
   $preset: function (prop) {
      return attrPreset(sceneConfig, prop);
   },
   $asset: function (id, asseturl) {
      return `<a-asset-item id="${id}" src="${asseturl}"></a-asset-item>`;
   }
};


var WebpackConfigX = function (mode) {
   //mode: 'development',
   this.mode = mode;

   this.entry = {
      index: path.resolve(__dirname, './../', 'src', 'index')
   };

   this.output = {
      path: path.resolve(__dirname, './../dist'),
      filename: '[name].js',
   };

   this.module = {
      rules: [{
            test: /.jsx?$/,
            include: [
               path.resolve(__dirname, './../', 'src')
            ],
            exclude: [
               path.resolve(__dirname, './../', 'node_modules')
            ],
            loader: 'babel-loader',
            query: {
               presets: [
                  ["@babel/env", {
                     "targets": {
                        "browsers": "last 2 chrome versions"
                     }
                  }]
               ]
            }
         },
         {
            test: /\.html$/,
            loader: 'ejs-loader'
         },
         {
            test: /\.(gltf|bin|glb|obj|fbx)$/,
            loader: 'file-loader',
            options: {
               name: '[name].[ext]',
               esModule: false,
               publicPath: (url, resourcePath, context) => {
                  if (mode == 'development') {
                     var relPath = './' + path.posix.join('./', slash(path.relative(path.resolve(__dirname, './../'), path.parse(resourcePath).dir)), url);
                     return relPath;
                  } else {
                     return `./assets/models/${url}`;
                  }
               },
               outputPath: (url, resourcePath, context) => {
                  return `./assets/models/${url}`;
               }
            }
         },
      ]
   };

   this.resolve = {
      extensions: ['.json', '.js', '.jsx']
   };

   this.plugins = [
      new HTMLWebpackPlugin({
         title: 'My VR Template',
         template: 'src/index.html',
         inject: 'head',
         templateParameters: htmlTemplateParameters,
         filename: 'index.html',
         chunks: ['index']
      }),
      new CleanWebpackPlugin()
   ];

   if (mode == 'development') {
      this.devtool = 'source-map';
      this.devServer = {
         bonjour: true,
         contentBase: path.resolve(__dirname, './../'),
         inline: true,
         host: 'localhost',
         port: 8080,
      };
   }

   if (mode === 'production') {
      this.optimization = {
         minimizer: [
            new TerserPlugin({
               extractComments: 'all',
               //exclude: /[\\/]angular[\\/]/,
               // parallel: true,
               terserOptions: {
                  drop_console: false,
                  ecma: undefined,
                  warnings: false,
                  parse: {},
                  compress: {},
                  mangle: true, // Note `mangle.properties` is `false` by default.
                  module: true,
                  output: null,
                  toplevel: false,
                  nameCache: null,
                  ie8: false,
                  keep_classnames: undefined,
                  keep_fnames: false,
                  safari10: false,
               },
               test: /\.js(\?.*)?$/i,
            }),
         ],
      };
      this.plugins.push(new CompressionPlugin({
         filename: '[path].gz[query]',
         algorithm: 'gzip',
         test: /\.(js|html|css|glb|gltf|bin|obj|fbx)$/,
         compressionOptions: {
            level: 9
         },
         //threshold: 0,
         minRatio: Number.MAX_SAFE_INTEGER,
         deleteOriginalAssets: true,
      }));
   }

   return this;

};

module.exports = (env, argv) => {
   return new WebpackConfigX(argv.mode);
};

/*      new CompressionPlugin({
         filename: '[path].gz[query]',
         algorithm: 'gzip',
         test: /\.(js|css|svg)$/,
         compressionOptions: { level: 9 },
         //threshold: 0,
         minRatio: 1,
         deleteOriginalAssets: true,
       }),
      new webpack.ProvidePlugin({
         $: 'jquery',
         jQuery: 'jquery'
      }),
      new HardSourceWebpackPlugin({
         cacheDirectory: 'C://tmp//supervr//cache'
      }),
   ],
   resolve: {
      extensions: ['.json', '.js', '.jsx']
   },
   optimization: {
      minimizer: [
           new TerserPlugin({
            extractComments: 'all',
            //exclude: /[\\/]angular[\\/]/,
           // parallel: true,
            terserOptions: {
              drop_console: false,
              ecma: undefined,
              warnings: false,
              parse: {},
              compress: {},
              mangle: true, // Note `mangle.properties` is `false` by default.
              module: true,
              output: null,
              toplevel: false,
              nameCache: null,
              ie8: false,
              keep_classnames: undefined,
              keep_fnames: false,
              safari10: false,
            },
            test: /\.js(\?.*)?$/i,
          }),
        ],
    }*/