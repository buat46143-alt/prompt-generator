import express from 'express';
import { generatePrompt, getProviders, getModels } from '../controllers/promptController.js';

const router = express.Router();

router.post('/generate', generatePrompt);
router.get('/providers', getProviders);
router.post('/models', getModels);

export default router;
