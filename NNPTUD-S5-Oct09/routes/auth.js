var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken')
let { Response } = require('../utils/responseHandler')
let {Authentication,Authorization}= require('../utils/authHandler')



router.post('/register', async function (req, res, next) {
  try {
    let role = await roles.findOne({ name: "USER" });
    if (!role) {
      Response(res, 500, false, "Default USER role not found");
      return;
    }
    
    let newUser = new users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: role._id
    })
    await newUser.save();
    Response(res, 200, true, "dang ki thanh cong");
  } catch (error) {
    if (error.code === 11000) {
      Response(res, 400, false, "Username or email already exists");
    } else {
      Response(res, 500, false, error.message);
    }
  }
});
router.post('/login', async function (req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    
    if (!username || !password) {
      Response(res, 400, false, "Username and password are required");
      return;
    }
    
    let user = await users.findOne({
      username: username
    })
    
    if (!user) {
      Response(res, 404, false, "user khong ton tai");
      return;
    }
    
    let result = bcrypt.compareSync(password, user.password);
    if (result) {
      let token = jwt.sign({
        _id: user._id,
        exp: Date.now() + 15 * 60 * 1000
      }, "NNPTUD");
      res.cookie("token", "Bearer " + token, {
        httpOnly: true,
        maxAge: 60 * 1000 * 60 * 24 * 7
      })
      Response(res, 200, true, token);
    } else {
      Response(res, 403, false, "user sai password");
    }
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});
router.post("/logout", function (req, res, next) {
  try {
    res.cookie("token", "");
    Response(res, 200, true, "logout thanh cong");
  } catch (error) {
    Response(res, 404, false, "token sai");
  }
})
router.get('/me',Authentication, Authorization("ADMIN","MOD","USER"),async function (req, res, next) {
   let user = await users.findById(req.userId).select(
    "username email fullname avatarURL"
   ).populate({
    path: 'role',
    select:'name'
  });
   Response(res,200,true,user)
})


module.exports = router;
