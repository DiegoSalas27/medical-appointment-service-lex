import morgan = require('morgan');
import cors = require('cors');
import express = require('express');

import { CitasMedicasController } from '../controllers/citas-medicas.controller';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('tiny'));

app.post("/medical-appointment/:patientId", CitasMedicasController.listarCitaMedica); // callable by frontend

export = app;