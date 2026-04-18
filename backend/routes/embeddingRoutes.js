import express from 'express';
import { indexEmbedding, searchSimilar } from '../controllers/embeddingController.js';

const router = express.Router();

router.post('/index', indexEmbedding);
router.post('/search', searchSimilar);

export default router;
