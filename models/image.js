var mongoose = require('mongoose');
var uuid = require('node-uuid');
var config = require('../config');
var db = mongoose.createConnection('mongodb://'+config.dbUser+':'+config.dbPassword+'@'+config.dbHost+':'+config.dbPort+'/'+config.dbName , function(err, res)
{
  if (err)
  {
    throw new Error('cant connect mongo db');
  }
});

var schema = new mongoose.Schema(
{
  _id: { type: String, default: function(){return uuid.v4().replace(/-/g,'');}},
  image: { type: String, index: false},
  loc: { type: [Number], index: '2dsphere'},
  timestamp: {type: Date, default: Date.now},
  tags: { type: [String] }
},{collection: 'imageDemo'});

module.exports = db.model('imageDemo', schema);
