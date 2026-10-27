const router=require('express').Router();
const {authenticate}=require('../middlewares/auth.middleware');
const inventory=require('../services/inventory.service');
router.use(authenticate);
router.get('/',async(req,res)=>{
  try{return res.apiSuccess(await inventory.listItems(req.user.ma_nguoi_dung));}
  catch(error){return res.apiError(error.message,'FETCH_ITEMS_FAILED',500);}
});
router.post('/:id/buy',async(req,res)=>{
  try{return res.apiSuccess(await inventory.purchaseItem(req.user.ma_nguoi_dung,req.params.id));}
  catch(error){return res.apiError(error.message,'BUY_ITEM_FAILED',400);}
});
router.put('/equipped',async(req,res)=>{
  try{return res.apiSuccess(await inventory.equipItem(req.user.ma_nguoi_dung,req.body.itemId??null));}
  catch(error){return res.apiError(error.message,'EQUIP_ITEM_FAILED',400);}
});
module.exports=router;
