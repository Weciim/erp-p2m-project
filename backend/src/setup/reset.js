require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function deleteData() {
  const Admin = require('../models/coreModels/Admin');
  const AdminPassword = require('../models/coreModels/AdminPassword');
  const Setting = require('../models/coreModels/Setting');


  await Admin.deleteMany();
  await AdminPassword.deleteMany();
  await Setting.deleteMany();


  process.exit();
}

deleteData();
