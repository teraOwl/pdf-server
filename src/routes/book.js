import {Router} from 'express'
import getBook from '../controllers/getBooks.js';

const router = Router();

//Route: /api/book

router.get('/:bookNameQuery', getBook);

export default router;