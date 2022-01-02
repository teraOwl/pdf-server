import {Router} from 'express'
import getTopRatedBooks from '../controllers/getTopRatedBooks.js';

const router = Router();

//Route: /api/topratedbooks

router.get('/', getTopRatedBooks);

export default router;