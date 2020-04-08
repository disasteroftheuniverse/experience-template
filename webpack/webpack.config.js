/*jshint esversion: 8*/
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {
   CleanWebpackPlugin
} = require('clean-webpack-plugin');
var styleParser = require('aframe/src/utils/styleParser');
var objectPath = require('object-path');
var _ = require('lodash');

var XMLParser = require('xml2json');
var fs = require('fs');

var attrPreset = function (obj, keypath) {
   var keys = keypath.split('.');
   var key = _.last(keys);

   var propertiesObj = objectPath.get(obj, keypath);
   var propertiesStr = styleParser.stringify(propertiesObj);

   var attr = `${key}="${propertiesStr}"`;
   console.log(attr);
   return attr;
};

var rawConfig = JSON.parse(XMLParser.toJson(fs.readFileSync(path.resolve(__dirname, './../config.xml'), {
   encoding: 'utf-8'
})));
var sceneConfig = rawConfig.presets;
//var renderSettings = attrPreset(sceneConfig,'scene.renderer');

//console.dir(renderSettings);
module.exports = {
   mode: 'development',
   entry: {
      index: path.join(__dirname, './../', 'src', 'index')
   },
   output: {
      path: path.resolve(__dirname, './../dist'),
      filename: '[name].js',
      //chunkFilename: '[name].js'
   },
   module: {
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
            test: /\.txt$/,
            loader: 'file-loader',
            options: {
               outputPath: (url,resourcePath, context)=>{
                  var boops = path.parse(resourcePath);
                  //console.log(boops);
                  var subdir='';

                  switch (boops.ext) {
                     case '.txt':
                        subdir='text/';
                        break;
                     case '.png':
                        subdir='images/';
                        break;
                     default:
                        subdir='';
                  }


                  return `/assets/${subdir}${url}`;
               },
               name: '[name].[ext]',
               esModule: false
            }
         }
      ]
   },
   resolve: {
      extensions: ['.json', '.js', '.jsx']
   },
   plugins: [
      new HTMLWebpackPlugin({
         inject: 'head',
         title: 'My VR Content',
         template: 'src/index.html',
         templateParameters: {
            //renderSettings
            $preset: function (prop) {
               return attrPreset(sceneConfig, prop);
            },
            $asset: function (id, asseturl) {
               //require(`file-loader!${asseturl}`);
               return `<a-asset-item id="${id}" src="${asseturl}"></a-asset-item>`;
            }
         },
         filename: 'index.html',
         chunks: ['index']
      }),
      new CleanWebpackPlugin()
   ],
   devtool: 'source-map',
   devServer: {
      contentBase: path.join(__dirname, './../', 'dist'),
      inline: true,
      host: 'localhost',
      port: 8080,
   }
};