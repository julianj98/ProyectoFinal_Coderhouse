import multer from "multer";
import path from 'path'

// Configura el almacenamiento y las opciones de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    if (file.originalname.includes("profile")) {
      uploadPath = "src/public/uploads/profiles";
    } else if (file.originalname.includes("product")) {
      uploadPath = "src/public/uploads/products";
    } else if (file.originalname.includes("document")) {
      uploadPath = "src/public/uploads/document";
    } else {
      uploadPath = "src/public/uploads/others";
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Genera un nombre de archivo único
    const originalName = file.originalname;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFileName = originalName + '-' + uniqueSuffix;

    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage });

export default upload