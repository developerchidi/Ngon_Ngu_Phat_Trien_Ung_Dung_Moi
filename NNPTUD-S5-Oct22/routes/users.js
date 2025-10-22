var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
let { uploadAFileWithField, uploadMultiFilesWithField } = require('../utils/uploadHandler');
let { Authentication } = require('../utils/authHandler');
let { Response } = require('../utils/responseHandler');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let allUsers = await users.find({isDeleted:false}).populate({
    path: 'role',
    select:'name'
  });
  res.send({
    success:true,
    data:allUsers
  });
});
router.get('/:id', async function(req, res, next) {
  try {
    let getUser = await users.findById(req.params.id);
    getUser = getUser.isDeleted ? new Error("ID not found") : getUser;
    res.send({
      success:true,
      data:getUser
    });
  } catch (error) {
     res.send({
      success:true,
      data:error
    });
  }
});

router.post('/', async function(req, res, next) {
  let role = req.body.role?req.body.role:"USER";
  let roleId;
  role = await roles.findOne({name:role});
  roleId = role._id;
  let newUser = new users({
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    role:roleId
  })
  await newUser.save();
  res.send({
      success:true,
      data:newUser
    })
});
router.put('/:id', async function(req, res, next) {
  let user = await users.findById(req.params.id);
  user.email = req.body.email?req.body.email:user.email;
  user.fullName = req.body.fullName?req.body.fullName:user.fullName;
  user.password = req.body.password?req.body.password:user.password;
  await user.save()
  res.send({
      success:true,
      data:user
    })
});

// Upload avatar cho user (yêu cầu đăng nhập)
router.post('/upload-avatar', Authentication, uploadAFileWithField('avatar'), async function(req, res, next) {
  try {
    if (!req.file) {
      return Response(res, 400, false, "Không có file được upload");
    }

    // Kiểm tra file có phải là ảnh không
    if (!req.file.mimetype.startsWith('image/')) {
      return Response(res, 400, false, "Chỉ được upload file ảnh");
    }

    // Tạo URL cho avatar
    const avatarURL = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
    
    // Cập nhật avatarURL cho user hiện tại
    const userId = req.userId;
    const user = await users.findById(userId);
    
    if (!user) {
      return Response(res, 404, false, "Không tìm thấy user");
    }

    user.avatarURL = avatarURL;
    await user.save();

    Response(res, 200, true, {
      message: "Upload avatar thành công",
      avatarURL: avatarURL,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarURL: user.avatarURL
      }
    });
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Upload nhiều ảnh (yêu cầu đăng nhập)
router.post('/upload-multiple-images', Authentication, uploadMultiFilesWithField('images'), async function(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return Response(res, 400, false, "Không có file nào được upload");
    }

    // Kiểm tra tất cả file có phải là ảnh không
    const invalidFiles = req.files.filter(file => !file.mimetype.startsWith('image/'));
    if (invalidFiles.length > 0) {
      return Response(res, 400, false, "Tất cả file phải là ảnh");
    }

    // Tạo URLs cho các ảnh
    const imageURLs = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `${req.protocol}://${req.get('host')}/files/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    Response(res, 200, true, {
      message: `Upload thành công ${req.files.length} ảnh`,
      images: imageURLs,
      count: req.files.length
    });
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
