require('dotenv').config();
const connectedTodb = require('./config/db');
const app = require('./src/app');


const PORT = process.env.PORT;
connectedTodb();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
