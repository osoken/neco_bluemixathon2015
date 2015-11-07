
var config = {
  dbHost: 'localhost',
  dbPort: 27017,
  dbName:'db',
  dbUser:'somebody',
  dbPassword:'***',
  selfHostAddress:'localhost',
  alchemyAPIKey :'none'
};

try
{
  var f = require('./config.json');
  Object.keys(f).forEach(function(d)
  {
    config[d] = f[d];
  });
}
catch (e)
{
}
module.exports = config;
