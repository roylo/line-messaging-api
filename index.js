module.exports = {
  client: function(conf) {
    return require('./lib/client').init(conf);
  }
}
