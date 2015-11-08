var express = require('express');
var router = express.Router();

var imageModel = require('../models/image');
var https = require('https');

var querystring = require('querystring');

var config = require('../config');

router.get('/api/image/:imageid([a-fA-F0-9]{8}[a-fA-F0-9]{4}[0-5][a-fA-F0-9]{3}[089aAbB][a-fA-F0-9]{3}[a-fA-F0-9]{12})', function(req,res,next)
{
  imageModel.findOne({'_id':req.params.imageid}, function(err,dat)
  {
    if (err != null)
    {
      return res.next(err);
    }
    if (dat == null || dat.image === void 0)
    {
      return res.next(new Error('something wrong'));
    }
    var buf = new Buffer(dat.image.replace(/^data:image\/[a-zA-Z]+;base64,/,''), 'base64');
    res.header('Content-Type', 'image/jpeg');
    res.header('Content-Length', buf.length );
    res.end(buf);
  });

});

router.get('/api/tags', function(req, res, next)
{
  imageModel.find({}, 'tags _id', function(err,dat)
  {
    res.json(dat);
  });
});

/* GET home page. */
router.get('/api/image', function(req, res, next)
{
//  imageModel.find({},'-image', function(err,dat)
  imageModel.find({},{},{sort:{timestamp: -1},limit:20}, function(err,dat)
  {
    res.json(dat);
  });
});

router.post('/api/image', function(req, res, next)
{
  var query = req.body;
  if (query.lat === void 0 || query.lon === void 0 || query.image === void 0 || (query.lat==0&&query.lon==0))
  {
    var err = new Error('invalid query');
    err.status = 400;
    return next(err);
  }
  query.loc = [+query.lon, +query.lat];
  query.timestamp = new Date();

  new imageModel(query).save(function(err,data)
  {
    if (err)
    {
      err.status = 400;
      return next(err);
    }
    var form = {};
    form.url = config.selfHostAddress + '/api/image/'+data._id;
    form.apikey = config.alchemyAPIKey;
    form.outputMode = 'json';
    var qs = querystring.stringify(form);
    var options = {
      host:'gateway-a.watsonplatform.net',
      path:'/calls/url/URLGetRankedImageKeywords?url='+form.url+'&apikey='+form.apikey+'&outputMode='+form.outputMode+'&knowledgeGraph=1',
    };
    var req2 = https.request(options, function(res2)
    {
      var body = '';
      res2.on('data', function (chunk) {
        body += chunk;
      });
      res2.on('end', function() {
        try {
          body = JSON.parse(body);
        } catch (e) {
          e.status = 500;
          return next(e);
        }
        if (body.imageKeywords === void 0)
        {
          var err = new Error('Alchemy API returns unexpected form of data');
          err.status = 500;
          return next(err);
        }
        imageModel.update({'_id': data._id},{'$set':{'tags':body.imageKeywords.map(function(d){return d.text;})}},{},function(err,nupdate)
        {
          return res.json({'_id': data._id});
        });
      })
    });
    req2.on('error', function(e) {
      return next(e);
    });
    req2.end();
  });

});

module.exports = router;
