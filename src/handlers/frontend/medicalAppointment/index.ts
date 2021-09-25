import dotenv = require("dotenv");
import "reflect-metadata";
import serverless = require('serverless-http');
import app = require('../../../app/medical-appointment.app');
dotenv.config();

const expressHandler = serverless(app);
export async function handler(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;
    const result = await expressHandler(event, context);
    return result;
};