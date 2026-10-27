const express = require('express');
const router = express.Router();
const petService = require('../services/pet.service');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');
router.post('/pets/care', authenticate, async (req,res) => {
  try { return res.apiSuccess(await require('../services/quest.service').carePet(req.user.ma_nguoi_dung,req.body.action)); }
  catch(err) { return res.apiError(err.message,'CARE_PET_FAILED',400); }
});

router.get('/pets', optionalAuthenticate, async (req, res) => {
  try {
    const userId = req.user ? req.user.ma_nguoi_dung : null;
    const pets = await petService.listPets(userId);
    return res.apiSuccess(pets);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_PETS_FAILED', 500);
  }
});

router.post('/pets/:id/buy', authenticate, async (req, res) => {
  try {
    const result = await petService.buyPet(req.params.id, req.user.ma_nguoi_dung);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'BUY_PET_FAILED', 400);
  }
});

router.post('/pets/:id/equip', authenticate, async (req, res) => {
  try {
    const result = await petService.equipPet(req.params.id, req.user.ma_nguoi_dung);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'EQUIP_PET_FAILED', 400);
  }
});

module.exports = router;
