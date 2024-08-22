import e, { Router } from 'express';
import controller from '../controllers/cars.js';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.retriveAll);
router.get('/:id', controller.retrieveOne)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)

export default router;