import express from 'express';
import { listHistory, addHistory, deleteHistory, clearHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', listHistory);
router.post('/', addHistory);
router.delete('/:id', deleteHistory);
router.post('/clear', clearHistory);

export default router;
