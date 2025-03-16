require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');


require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.DATABASE);


const modelsFiles = globSync('./src/models/**/*.js');

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});
