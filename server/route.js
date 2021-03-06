const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/send/pw', controller.api.sendPw);

router.post('/search/id', controller.search.id);
router.post('/search/pw', controller.search.pw);

router.post('/add/board', controller.add.board);
router.post('/add/category', controller.add.category);
router.post('/add/user', controller.add.user);
router.post('/add/reply', controller.add.reply);

router.post('/update/view_cnt', controller.update.view_cnt);
router.post('/update/password', controller.update.password);
router.post('/update/like', controller.update.like);
router.post('/update/board', controller.update.board);

router.post('/delete/category', controller.delete.category);
router.post('/delete/board', controller.delete.board);
router.post('/delete/reply', controller.delete.reply);

router.post('/modify/category', controller.modify.category);

router.get('/get/category', controller.get.category);

router.post('/check/like', controller.check.like);

router.post('/get/board', controller.get.board);
router.post('/get/board_cnt', controller.get.board_cnt);
router.post('/get/board_data', controller.get.board_data);
router.post('/get/pre_and_next', controller.get.pre_and_next);
router.post('/get/reply_data', controller.get.reply_data);
router.post('/get/user_info', controller.get.user_info);


module.exports = router;