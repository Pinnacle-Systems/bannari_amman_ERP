import { Router } from 'express';
const router = Router();
import { get, search, getOne, getSearch,  create, update, remove} from '../controllers/gsm.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/search', search);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;