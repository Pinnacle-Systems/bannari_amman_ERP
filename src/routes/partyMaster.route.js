import { Router } from 'express';
const router = Router();
import { get, search, getOne, getSearch, create, update, remove, getNew } from '../controllers/partyMaster.controller.js';
import { multerUploadForGrid } from '../utils/multerUpload.js';

router.post('/', multerUploadForGrid.array('images'), create);

router.get('/new', getNew);

router.get('/', get);

router.get('/search', search);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', multerUploadForGrid.array('images'), update);

router.delete('/:id', remove);

export default router;