import userModel from '../dao/mongo/models/user.js';
import multer from "multer";
import transporter from "../utils/email.js";

//import upload from '../middlewares/uploadFileMulter.js';
const updateUserRole = async (req, res) => {
  const { uid } = req.params;
  
  try {
    // Buscar el usuario por su ID
    const user = await userModel.findById(uid);
    
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    // Nombres de documentos requeridos
    const requiredDocuments = ['document-identificacion .docx', 'document-comprobante-de-domicilio.docx', 'document-comprobante-de-estado-de-cuenta.docx'];

    // Verificar si el usuario ha cargado todos los documentos requeridos
    const userHasAllRequiredDocuments = requiredDocuments.every(requiredDocumentName => {
      return user.documents.some(doc => doc.name === requiredDocumentName);
    });
    //console.log(userHasAllRequiredDocuments);

    if (userHasAllRequiredDocuments) {
      // Cambiar el rol del usuario a premium
      user.rol = 'premium';
      // Guardar los cambios en la base de datos
      await user.save();
      res.json({ status: 'success', message: 'Rol de usuario actualizado a premium', user });
    } else {
      res.status(400).json({ status: 'error', message: 'El usuario debe cargar todos los documentos requeridos antes de convertirse en premium' });
    }
  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el rol del usuario' });
  }
};

const uploadFile = async (req,res)=>{
  try {
    // Obtiene el ID de usuario desde los parámetros de la ruta
    const userId = req.params.uid;

    // Busca al usuario por su ID
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Verifica si req.files está definido y contiene archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    // Accede a los nombres de archivo originales
    const originalFileNames = req.files.map((file) => file.originalname);
    console.log('Nombres de archivo originales:', originalFileNames);
    const { reference } = req.body;

    // Obtiene el nombre original del archivo subido
    //console.log(req.file);
    const originalFileName = req.files[0].originalname;
    //console.log('Nombre del primer archivo:', originalFileName);
    // Crea un nuevo documento
    const newDocument = {
      name: originalFileName, // Usamos el nombre original
      reference,
    };

    // Agrega el nuevo documento al array de documentos del usuario
    user.documents.push(newDocument);

    // Guarda los cambios en la base de datos
    await user.save();

    res.status(200).json({ message: 'Documento agregado al usuario exitosamente' });
  } catch (error) {
    console.error('Error al agregar documento al usuario:', error);
    res.status(500).json({ error: 'Error al agregar documento al usuario' });
  }
}

const getAllUsers = async (req,res)=>{
  try {
    const users = await userModel.find({}, 'first_name last_name email rol -_id'); // Solo se recuperan los campos deseados
    res.status(200).json({ status: 'success', users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener usuarios' });
  }
};

const deleteInactiveUsers = async (req, res) => {
  try {
    const interval = 2 * 24 * 60 * 60 * 1000; // 5 * 60 * 1000 ||2 * 24 * 60 * 60 * 1000
    const currentDate = new Date();
    const cutoffDate = new Date(currentDate - interval);

    const deletedUsers = await userModel.find({ last_connection: { $lt: cutoffDate } });
    if (deletedUsers.length > 0) {

      // Envía un correo a cada usuario eliminado
      deletedUsers.forEach(async (user) => {
        const mailOptions = {
          from: 'CoderCommerce@gmail.com',
          to: user.email,
          subject: 'Eliminación de cuenta por inactividad',
          text: 'Tu cuenta ha sido eliminada debido a inactividad en nuestra plataforma.',
        };

        await transporter.sendMail(mailOptions);
      });
    }

    const result = await userModel.deleteMany({ last_connection: { $lt: cutoffDate } });
    res.status(200).json({ status: 'success', message: `${result.deletedCount} usuarios eliminados` });
  } catch (error) {
    console.error('Error al eliminar usuarios inactivos:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar usuarios inactivos' });
  }
};

export { updateUserRole,uploadFile, getAllUsers, deleteInactiveUsers };