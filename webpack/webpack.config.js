/*jshint esversion: 8*/
const path = require('path');
const slash = require('slash');
var mime = require('mime-types');
const randomWords = require('random-words');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
var OfflinePlugin = require('offline-plugin');

var styleParser = require('aframe/src/utils/styleParser');
var objectPath = require('object-path');
var _ = require('lodash');

/**
      HTML Template Parameters
*/
var sceneConfig = require('./settings');
var htmlTemplateParameters = require('./templates') ( sceneConfig, objectPath, _, mime, randomWords, styleParser, path );
var fileLoaderDest = require('./outputPaths');

/**
      Webpack Config
*/

var WebpackConfigX = function (mode) {
   this.mode = mode;
   this.entry = {
      index: path.resolve(__dirname, './../', 'src', 'index')
   };
   this.output = {
      path: path.resolve(__dirname, './../dist'),
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[contentHash].js',
   };
   this.module = {
      rules: [
         {test: /.jsx?$/,
            include: [path.resolve(__dirname, './../', 'src')],
            exclude: [path.resolve(__dirname, './../', 'node_modules')],
            loader: 'babel-loader',
            query: {presets: [['@babel/env', {'targets': {'browsers': 'last 2 chrome versions'}}]]}
         },{
            test: /\.html$/,
            loader: 'ejs-loader'
         },{
            test: /\.css$/,
            use: [
               {loader: 'style-loader'}, 
               {loader: 'css-loader'},               
            ],
         },{
            test: /\.(bin|gltf|glb|obj|fbx|png|jpeg|jpg|png|mp4|gif|wav|obj|mtl|dae|mp3)$/,
            loader: 'file-loader',
            options: {
               name: '[name].[ext]',
               esModule: false,
               publicPath: (url, resourcePath, context) => {
                  if (mode == 'development') {
                     var relPath = './' + path.posix.join('./', slash(path.relative(path.resolve(__dirname, './../'), path.parse(resourcePath).dir)), url);
                     return relPath;
                  } else {
                     return fileLoaderDest(url, resourcePath, context);
                  }
               },
               outputPath: fileLoaderDest
            }
         },
         {
            test: /\.(xxyyxx)$/,
            loader: ['file-loader']
         },
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
      new HardSourceWebpackPlugin({
         cacheDirectory: path.resolve('C:\\tmp\\blah'),
      }),
      new CleanWebpackPlugin(),
      new OfflinePlugin()
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
         runtimeChunk: 'single',
         splitChunks: {
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
         },
         minimizer: [
            new TerserPlugin({
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
            }),
         ],
      };

      var prodPlugins = [
         new CompressionPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css|glb|gltf|bin|obj|fbx)$/,
            compressionOptions: {
               level: 9
            },
            minRatio: Number.MAX_SAFE_INTEGER,
            deleteOriginalAssets: true,
         })
         
      ];

      this.plugins = this.plugins.concat(prodPlugins);
   }

   return this;

};

module.exports = (env, argv) => {
   return new WebpackConfigX(argv.mode);
};