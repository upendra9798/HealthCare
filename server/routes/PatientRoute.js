import { Router } from 'express';
import { verifyToken } from '../middlewares/AuthMiddleware.js';
import { registerPatient, getAllPatients, getPatientById, updatePatient, deletePatient } from '../controllers/PatientController.js';

const patientRoutes = Router();

patientRoutes.post('/register', registerPatient);
patientRoutes.get('/get-all', verifyToken, getAllPatients);
patientRoutes.get('/get-patient/:id', verifyToken, getPatientById);
patientRoutes.put('/update-patient/:id', verifyToken, updatePatient);
patientRoutes.delete('/delete-patient/:id', verifyToken, deletePatient);

export default patientRoutes; 