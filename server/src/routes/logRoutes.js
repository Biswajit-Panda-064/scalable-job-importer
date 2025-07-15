import express from 'express';
import { getImportLogs} from '../controller/logController.js';

const router = express.Router();

router.get('/', getImportLogs);

export default router;
