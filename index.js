const path = require('path')

module.exports = {
  publicPath: function() {
    return path.join(__dirname, 'public')
  },
};