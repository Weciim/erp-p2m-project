
const express = require('express');

const { catchErrors } = require('@/handlers/errorHandlers');

const router = express.Router();

const settingController = require('@/controllers/coreControllers/settingController');
const adminController = require('@/controllers/coreControllers/adminController');
const { singleStorageUpload } = require('@/middlewares/uploadMiddleware');


// //____________________________________________ API for Global Setting _________________

router.route('/setting/create').post(catchErrors(settingController.create));
router.route('/setting/read/:id').get(catchErrors(settingController.read));
router.route('/setting/update/:id').patch(catchErrors(settingController.update));
//router.route('/setting/delete/:id).delete(catchErrors(settingController.delete));
router.route('/setting/search').get(catchErrors(settingController.search));
router.route('/setting/list').get(catchErrors(settingController.list));
router.route('/setting/listAll').get(catchErrors(settingController.listAll));
router.route('/setting/filter').get(catchErrors(settingController.filter));
router
  .route('/setting/readBySettingKey/:settingKey')
  .get(catchErrors(settingController.readBySettingKey));
router.route('/setting/listBySettingKey').get(catchErrors(settingController.listBySettingKey));
router
  .route('/setting/updateBySettingKey/:settingKey?')
  .patch(catchErrors(settingController.updateBySettingKey));

router.route('/setting/updateManySetting').patch(catchErrors(settingController.updateManySetting));
//_______________________________ Admin Profile _______________________________

router.route('/admin/profile/password').patch(catchErrors(adminController.updateProfilePassword));
router
  .route('/admin/profile/update')
  .patch(
    singleStorageUpload({ entity: 'admin', fieldName: 'photo', fileType: 'image' }),
    catchErrors(adminController.updateProfile)
  );

module.exports = router;