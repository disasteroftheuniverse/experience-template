/*jshint esversion: 8*/
//const path = require('path');
//var UserSchema = {};

var shortid = require('shortid');

module.exports = {
   Enum: function (name, list, init) {
      this.name = name;
      this.uid = shortid.generate();
      this.type = 'enum';
      this.list = list;
      this.value=this.list[0];
    return this;
   },
   Toggle: function (name, value, init) {
      this.name = name;
      this.uid = shortid.generate();
      this.type = 'toggle';
      this.value=value;
      return this;
   },
   Msg: function (name, value) {
      this.name = name;
      this.uid = shortid.generate();
      this.type = 'msg';
      this.value=value;
      return this;
   }
};