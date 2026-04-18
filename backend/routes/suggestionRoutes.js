import express from 'express';
import { suggestPrompt } from '../controllers/suggestionController.js';

const router = express.Router();

router.post('/', suggestPrompt);

export default router;
