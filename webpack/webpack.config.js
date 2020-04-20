/*jshint esversion: 8*/

/**
      Library Dependencies ❤
*/
const path = require('path');
const slash = require('slash');
var mime = require('mime-types');
const randomWords = require('random-words');
var fs = require('fs');
var url = require('url');
var shortId = require('shortid');
//const WebpackShellPlugin = require('webpack-shell-plugin');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
var compressionExtensionRegex = /\.(js|css|glb|gltf|bin|obj|fbx|mp3)$/;

const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
var OfflinePlugin = require('offline-plugin');
var assetManifest = {};

var styleParser = require('aframe/src/utils/styleParser');
var objectPath = require('object-path');
var _ = require('lodash');

var expressMap = [];

/**
      HTML Templates
*/
var sceneConfig = require('./webpack.vr.settings');
var htmlTemplateParameters = require('./webpack.templates')( 
   sceneConfig, objectPath,
    _, mime, randomWords, 
    styleParser, path, assetManifest, compressionExtensionRegex );
var fileLoaderDest = require('./webpack.paths');


/**
   Webpack Config
*/
var WebpackConfigX = function (mode, isdevbuild) {

   this.mode = mode;

   this.entry = {
      index: path.resolve(__dirname, './../', 'src', 'index')
   };

   this.output = {
      path: path.resolve(__dirname, './../dist'),
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/lib/[name].js',
   };

   this.module = {
      rules: [
         {
            test: /.jsx?$/,
            include: [
               path.resolve(__dirname, './../src')
            ],
            exclude: [
               path.resolve(__dirname, './../node_modules')
            ],
            loader: 'babel-loader',
            query: {
               presets: [
                  ['@babel/env', {
                     'targets': {
                        'browsers': 'last 2 chrome versions'
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
            test: /\.css$/,
            use: [
               {loader: 'style-loader'}, 
               {loader: 'css-loader'},               
            ],
         },
         {
            test: /\.(bin|gltf|glb|obj|fbx|png|jpeg|jpg|png|mp4|gif|wav|obj|mtl|dae|mp3)$/,

            loader: 'file-loader',
            options: {
               name: (mode==='development') ? '[name].[ext]' : '[name].[contenthash].[ext]',
               esModule: false,
               publicPath: (url, resourcePath, context) => {
                  if (mode == 'development' && isdevbuild===false) {
                     var relPath = './' + path.posix.join('./', slash(path.relative(path.resolve(__dirname, './../'), path.parse(resourcePath).dir)), url);
                     expressMap.push(relPath);
                     return relPath;
                  } else {
                     var dest = fileLoaderDest(url, resourcePath, context);
                     expressMap.push(dest);
                     return dest;
                  }
               },
               outputPath: fileLoaderDest
            }
         }
      ]
   };

   this.resolve = {
      extensions: ['.json', '.js', '.jsx']
   };

   this.plugins = [
      new HTMLWebpackPlugin({
         //cache: true,
         title: 'My VR Template',
         template: 'src/index.html',
         inject: 'head',
         templateParameters: htmlTemplateParameters,
         xhtml: false,
         filename: 'index.html',
         chunks: ['index'],
         minify: {
            collapseWhitespace: false
         },
      }),
      /*new HardSourceWebpackPlugin({
         cacheDirectory: path.resolve('C:\\tmp\\blah'),
      }),*/
      new CleanWebpackPlugin(),
      {
         apply: (compiler)=>{
            compiler.hooks.done.tap('myAssetManifest',(outputData)=>{
               var renderedAssets = _.keys(outputData.compilation.assets);
               
               var assetCollection = {};

               _.each(renderedAssets, (asset)=>{
                  var assetPath = path.posix.parse(asset);

                  var niceURL = url.format((assetPath.ext==='.gz') ? path.posix.join(assetPath.dir,assetPath.name) : path.posix.join(assetPath.dir,assetPath.name+assetPath.ext))
                  var assetDesc = {
                     //url: (assetPath.ext==='.gz') ? path.posix.join(assetPath.dir,assetPath.name) : path.posix.join(assetPath.dir,assetPath.name+assetPath.ext),
                     compressed: (assetPath.ext==='.gz'),
                     compressedURL: (assetPath.ext==='.gz') ? url.format(path.posix.join(assetPath.dir,assetPath.name+assetPath.ext)) : null,
                     url: niceURL,
                     contentType: mime.contentType(path.posix.parse(niceURL).ext),
                     type: mime.lookup(path.posix.parse(niceURL).ext),
                     
                  };
                  assetCollection[niceURL]=assetDesc;


               });

               console.log(assetCollection);

               var manifest = Buffer.from(JSON.stringify(assetCollection,null,4));

               fs.writeFileSync(path.resolve(__dirname,'./../dist/','express.json'),manifest,{encoding:'utf-8'});

              
            });
         }
      }
   ];

   var vendorChunks = {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
         vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
               const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
               return `npm.${packageName.replace('@', '')}`; 
            },
         },
      },
   };

   var terserProductionSettings = new TerserPlugin({
      //extractComments: 'all',
      //exclude: /[\\/]angular[\\/]/,
      // parallel: true,
      terserOptions: {
         drop_console: true,
         ecma: undefined,
         warnings: false,
         parse: {},
         compress: {},
         mangle: true, // Note `mangle.properties` is `false` by default.
         module: true,
         toplevel: false,
         nameCache: null,
         ie8: false,
         keep_classnames: undefined,
         keep_fnames: false,
         safari10: false,
         output: {
            comments: false
         }
      },
      test: /\.js(\?.*)?$/i,
      //exclude: /sw.js/,
   });

   if (mode == 'development') {
      this.devtool = 'source-map';

      this.optimization = {
         splitChunks: vendorChunks,
      };

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
         //runtimeChunk: 'single',
         //splitChunks: vendorChunks,
         minimizer: [terserProductionSettings],
      };

      var productionPlugins = [
         new CompressionPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: compressionExtensionRegex,
            compressionOptions: {
               level: 9
            },
            minRatio: Number.MAX_SAFE_INTEGER,
            deleteOriginalAssets: true,
         })
         
      ];

      this.plugins = this.plugins.concat(productionPlugins);
   }

   return this;

};

/**
   Export Module
*/
module.exports = (env, argv) => {
   var isDevBuild = (argv && argv.devbuild && argv.devbuild==='true') ? true : false;
   //console.log(isDevBuild);
   return new WebpackConfigX(argv.mode,isDevBuild);
};