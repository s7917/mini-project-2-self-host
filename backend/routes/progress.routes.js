const router = require('express').Router();
const ProgressController = require('../controllers/ProgressController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const logger = require('../middlewares/logger');
const { progressCreateSchema, progressPatchSchema } = require('../utils/validators/progressValidator');

router.post('/', authenticate, validate(progressCreateSchema), logger, ProgressController.create);
router.get('/', authenticate, logger, ProgressController.getAll);
router.get('/:id', authenticate, logger, ProgressController.getById);
router.put('/:id', authenticate, validate(progressCreateSchema), logger, ProgressController.update);
router.patch('/:id', authenticate, validate(progressPatchSchema), logger, ProgressController.patch);
router.delete('/:id', authenticate, authorize('admin'), logger, ProgressController.remove);

module.exports = router;
