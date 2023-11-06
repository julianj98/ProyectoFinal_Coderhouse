import { Router } from "express";
import userModel from "../dao/mongo/models/user.js";
import passport from "passport";
import {authenticateGithub,githubCallback,handleGithubCallback, getCurrentUser, registerUser, loginUser, logoutUser, sendPasswordResetEmail, resetPassword } from "../controllers/sessionControllers.js";
const router = Router();

router.get("/github", authenticateGithub);

router.get("/githubcallback",  passport.authenticate("github"), handleGithubCallback); // Agrega el nuevo controlador

router.post('/register',registerUser);

router.post('/login',loginUser);

router.post('/logout',logoutUser );

router.get('/current',getCurrentUser)

router.post('/resetpassword', sendPasswordResetEmail);

router.post('/resetpassword/:token',resetPassword );


export default router;