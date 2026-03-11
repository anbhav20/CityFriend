const mongoose = require('mongoose');

function connectedTodb(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('database is connected')
    })
}

module.exports = connectedTodb;