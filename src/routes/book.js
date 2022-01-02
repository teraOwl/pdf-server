import {Router} from 'express'
import getBook from '../controllers/getBook.js';

const router = Router();

//Route: /api/book

router.get('/:bookNameQuery', getBook);

export default router;