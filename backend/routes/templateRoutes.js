import express from 'express';
import { listTemplates, upsertTemplate, deleteTemplate, rateTemplate } from '../controllers/templateController.js';

const router = express.Router();

router.get('/', listTemplates);
router.post('/', upsertTemplate);
router.delete('/:id', deleteTemplate);
router.post('/rate', rateTemplate);

export default router;
