var express = require('express');
var router = express.Router();
let roleSchema = require('../schemas/roles');
let { Response } = require('../utils/responseHandler');

/* GET roles listing. */
router.get('/', async function(req, res, next) {
  try {
    let roles = await roleSchema.find({isDeleted:false});
    Response(res, 200, true, roles);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});
router.get('/:id', async function(req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role || role.isDeleted) {
      Response(res, 404, false, "Role not found");
      return;
    }
    Response(res, 200, true, role);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

router.post('/', async function(req, res, next) {
  try {
    if (!req.body.name) {
      Response(res, 400, false, "Role name is required");
      return;
    }
    let newRole = new roleSchema({
      name: req.body.name,
      description: req.body.description || ''
    });
    await newRole.save();
    Response(res, 201, true, newRole);
  } catch (error) {
    if (error.code === 11000) {
      Response(res, 400, false, "Role name already exists");
    } else {
      Response(res, 500, false, error.message);
    }
  }
});

module.exports = router;
