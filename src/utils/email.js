import nodemailer from 'nodemailer';
import {createTransport } from "nodemailer"
import dotenv from 'dotenv';
dotenv.config({ path: 'src/.env' });

const EMAIL = process.env.EMAIL
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD
    }
});


export default transporter