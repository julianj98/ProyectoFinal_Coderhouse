import { Router } from "express";
import userModel from "../dao/mongo/models/user.js";
import passport from "passport";
import UserDTO from "../DTOs/UserDTO.js";
const router = Router();
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import transporter from "../utils/email.js";
import bcrypt from 'bcrypt';

const authenticateGithub = passport.authenticate("github");

const githubCallback = passport.authenticate("github", {
  successRedirect: "/products",
  failureRedirect: "/login", // Puedes redirigir a otra página en caso de fallo
});

const handleGithubCallback = async (req, res) => {
  req.session.user = {
    name: req.user.first_name + " " + req.user.last_name,
    email: req.user.email,
    rol: req.user.email === "adminCoder@coder.com" ? "admin" : "user",
  };
  res.redirect("/products");
};
const getCurrentUser = (req,res)=>{
    if (req.session.user) {
      const { name, email, rol } = req.session.user;
      const userDTO = new UserDTO(name, email, rol);
      res.json({ status: 'success', user: userDTO });
    } else {
      // Si no hay un usuario en la sesión, significa que no está autenticado
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }
  }

const registerUser = (req, res, next) => {
    passport.authenticate("register", (err, user, info) => {
      if (err) {
        return res.status(500).json({ status: "error", error: err });
      }
      if (!user) {
        return res.status(400).json({ status: "error", error: info.message });
      }
    // Verificar si el correo es "adminCoder@coder.com"
      if (user.email === "adminCoder@coder.com") {
      user.rol = "admin"; // Asignar el rol como "admin"
      }try {
        
      //await user.save(); // Guardar el usuario en la base de datos
      res.json({ status: "success", payload: user });
      } catch (error) {      
      }
    })(req, res, next);
  }

const loginUser = (req, res, next)=>{
    passport.authenticate("login", (err, user, info) => {
      if (err) {
        return res.status(500).json({ status: "error", error: err });
      }
      if (!user) {
        return res.status(400).json({ status: "error", error: info.message });
      }
      // Si la autenticación es exitosa, crea la sesión
      req.session.user = {
        _id: user._id, // Agregar el campo _id del usuario
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age:user.age,
        rol: user.rol,
      };
      user.updateLastConnection();

      res.json({ status: "success" });
    })(req, res, next);
  }

const logoutUser =(req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ status: "Error", error });
      }
      res.json({ status: "Success", message: "Logout successful" });
    });
  }
  
  const sendPasswordResetEmail = async (req, res) => {
;
    try {
      const { email } = req.body;
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
  
      // Generar un token único y guardarlo en la base de datos junto con una marca de tiempo de expiración
      const token = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora de expiración
      await user.save();

      // Enviar el correo de restablecimiento de contraseña
      const resetLink = `http://localhost:8080/api/sessions/resetpassword/${token}`;
      const mailOptions = {
        to: email,
        subject: 'Restablecimiento de contraseña',
        text: `Haga clic en este enlace para restablecer su contraseña: ${resetLink}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending password reset email:', error);
          return res.status(500).json({ status: 'error', message: 'Error sending email' });
        }
        console.log('Password reset email sent:', info.response);
        res.json({ status: 'success', message: 'Password reset email sent' });
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      res.status(500).json({ status: 'error', message: 'Error sending email' });
    }
  };
  
  const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      //console.log(token);
      const user = await userModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      //console.log(user);
      if (!user) {
        return res.status(400).json({ status: 'error', message: 'Invalid or expired token' });
      }
  
      // Verificar que la nueva contraseña no sea igual a la contraseña anterior
      const { newPassword } = req.body;
      if (newPassword === user.password) {
        return res.status(400).json({ status: 'error', message: 'New password cannot be the same as the old password' });
      }
    // Hashear la nueva contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 es el número de rondas de hashing
    // Actualizar la contraseña hasheada en el usuario
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  
      res.json({ status: 'success', message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ status: 'error', message: 'Error resetting password' });
    }
  };
  

export {
    authenticateGithub,
    githubCallback,
    handleGithubCallback,
    getCurrentUser,
    registerUser,
    loginUser,
    logoutUser,
    sendPasswordResetEmail,
    resetPassword
}