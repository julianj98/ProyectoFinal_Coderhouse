import { Router } from "express";
import ProductsManager from "../dao/mongo/manager/products.js";
import { io } from "../app.js";
import MongoProductRepository from "../repositories/mongoProductRepository.js";
import { createError, PRODUCT_NOT_FOUND, INSUFFICIENT_STOCK, MISSING_FIELDS } from '../errorHandler.js';
import logger from "../utils/logger.js";
import transporter from "../utils/email.js";
import userModel from '../dao/mongo/models/user.js';

//const productsManager = new ProductsManager();
const productRepository = new MongoProductRepository();

const getProducts= async (req, res) => {
    const { limit = 10, page = 1, sort, query,available  } = req.query;

    // Construir el objeto de opciones de filtrado y ordenamiento
    const options = {};
    // Aplicar el límite de elementos
    options.limit = parseInt(limit);
  
    // Calcular el desplazamiento (skip) en función de la página solicitada
    const skip = (parseInt(page) - 1) * parseInt(limit);
    options.skip = skip;
  
    // Aplicar el ordenamiento si se proporciona el parámetro sort
    if (sort === "asc") {
      options.sort = { price: 1 };
    } else if (sort === "desc") {
      options.sort = { price: -1 };
    }
  
    // Construir el objeto de filtro en función del parámetro query
    const filter = {};

    if (query) {
      filter.category = query;
    }
    
    if (available) {
      filter.stock = { $gt: 0 };
    }

    try {
      // Realizar la consulta a la base de datos
      const products = await productRepository.getAll(filter, options);
      const totalProducts = await productRepository.getProductsCount(filter);
      const totalPages = Math.ceil(totalProducts / options.limit);
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ?  parseInt(page) + 1 : null;
      const hasPrevPage = prevPage !== null;
      const hasNextPage = nextPage !== null;
      // Calcular el enlace directo a la página previa
      const prevLink = page > 1 ? `/api/products?limit=${limit}&page=${page - 1}` : null;

      // Calcular el enlace directo a la página siguiente
      const nextLink = page < totalPages ? `/api/products?limit=${limit}&page=${parseInt(page) + 1}` : null;
  
      res.json({ status: "success", payload: products, page:page,  totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,});
    } catch (error) {
      res.status(500).json({ status: "error", message: "Error al obtener los productos" +error});
    }
  }

const addProducts=async (req,res)=>{
    const {title, description, code, price , status,stock,category,thumbnail} = req.body
    const requiredFields = ['title', 'description','code','price','status','stock','category']; // Lista de campos requeridos
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
        const errorDetails = missingFields.map((field) => ({
          field,
        }));
    
        const error = createError('MISSING_FIELDS', { details: errorDetails });
        logger.error('Missing required fields', error);

        return res.status(400).json({ status: 'error', message: 'Missing required fields', error });
      }
    try {
      const ownerEmail = req.session.user.email;

      // Crea un nuevo objeto de producto con el owner establecido automáticamente
      const product = {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnail,
        owner: ownerEmail, // Asignar el email del usuario autenticado como owner
      };
        const createdProduct = await productRepository.create(product)
        logger.info('Product added successfully', { product: createdProduct }); 
        res.status(201).json({status:"ok",data:createdProduct})
    } catch (error) {
      logger.error('Error while adding product', error); 
        return     res.status(400).json({status:"error",message:"Cannot get products: "+ error})
    }}


const getProductsById = async (req,res)=>{
    const {id} = req.params;
    try {
        const product = await productRepository.getById(id);
        logger.info('Product obtained successfully', { product}); 
        res.json({status: "ok", data:product})
    } catch (error) {
        logger.error('Error while getting product', error); 
         return     res.status(400).json({status:"error",message:"Cannot get product: "+ error})

    }
}

const updateProducts = async(req,res)=>{
    const {title, description, code, price , status,stock,category,thumbnail} = req.body
    if (!title || !description || !code || !price || !status  || !category){
        return res.status(400).json({status:"error",message: "no data sent!"})
    }
    const {id} = req.params;
    const newProduct=req.body;
    try {
        await productRepository.update(id,newProduct);
        logger.info('Product updated successfully', { newProduct}); 
        res.json({status:"ok", data:newProduct})
    } catch (error) {
      logger.error('Error while updating product', error); 
        return res.status(400).json({status:"error",message:"Cannot update product: "+ error})
    }

}

const deleteProducts = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener el producto que se va a eliminar
    const product = await productRepository.getById(id);

    // Verificar si el usuario es el propietario o un administrador
    if (
      req.session.user.rol === "admin" || // El usuario es un administrador
      (req.session.user.rol === "premium" && product.owner === req.session.user.email) // El usuario es premium y es el propietario
    ) {
      // Realizar una consulta para verificar si el propietario del producto es premium
      const ownerIsPremium = await userModel.findOne({ email: product.owner, rol: "premium" });

      // Realizar la eliminación del producto
      await productRepository.delete(id);
      logger.info('Product deleted successfully');

      // Enviar un correo al propietario premium si es el propietario
      if (ownerIsPremium) {
        const mailOptions = {
          from: 'CoderCommerce@gmail.com', // Reemplaza con tu dirección de correo
          to: product.owner,
          subject: 'Notificación de eliminación de producto',
          text: `El producto "${product.title}" que poseías ha sido eliminado.`
        };

        // Enviar el correo electrónico utilizando el middleware de Nodemailer
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error al enviar el correo:', error);
          } else {
            console.log('Correo enviado: ' + info.response);
          }
        });
      }

      return res.json({ status: "success" });
    } else {
      // El usuario no tiene permiso para realizar la eliminación
      logger.error('Access forbidden for this product');
      return res.status(403).json({ status: "error", message: "Access forbidden for this product" });
    }
  } catch (error) {
    // Manejar errores
    console.error("Error deleting product:", error);
    return res.status(500).json({ status: "error", message: "Error deleting product" });
  }
};


export  {
    getProducts,
    addProducts,
    getProductsById,
    updateProducts,
    deleteProducts
}