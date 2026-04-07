const mongoose = require('mongoose');

function connectedTodb() {
  return mongoose.connect(process.env.MONGO_URI) //  add return
    .then(() => {
      console.log(' Database connected');
    });
}

module.exports = connectedTodb;