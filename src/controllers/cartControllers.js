import { Router } from "express";
//import CartManager from "../CartManager.js";
import CartsManager from "../dao/mongo/manager/carts.js";
import ProductsManager from "../dao/mongo/manager/products.js";
import MongoCartRepository from "../repositories/mongoCartRepository.js";
import MongoProductRepository from "../repositories/mongoProductRepository.js";
import TicketsManager from "../dao/mongo/manager/tickets.js";
import mongoose from "mongoose";
import { createError, PRODUCT_NOT_FOUND, INSUFFICIENT_STOCK } from '../errorHandler.js';
import logger from "../utils/logger.js";


const productsManager = new ProductsManager();
//const cartManager = new CartManager();
const cartsManager = new CartsManager();
const cartRepository = new MongoCartRepository();
const productRepository = new MongoProductRepository();
const ticketsManager = new TicketsManager();

const getCartById =async (req, res) => {
    const { id } = req.params;
    const cart = await cartRepository.getById(id);
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  }

const createCart = async (req, res) => {
  try {
    const { products } = req.body;

    // Verificar si el usuario está autenticado en la sesión
    if (!req.session.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }
    console.log(req.session.user)
    const userId = req.session.user._id; // Obtener el ID de usuario
    console.log(userId);
    const cart = { user: userId, products }; // Pasar el ID de usuario en lugar del objeto user
    const newCart = await cartRepository.create(cart);
    const response = { status: 'success', message: 'El carrito se creó con éxito', cart: newCart };

    return res.status(201).json(response);

  } catch (error) {
    logger.error('Error while adding cart', error); 
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor ' + error });
  }
};


const addProductToCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Obtener el carrito y el producto
    const cart = await cartRepository.getById(cid);
    const product = await productRepository.getById(pid);

    if (!cart || !product) {
      return res.status(404).json({ status: "error", message: "Cart or product not found" });
    }

    // Verificar si el usuario es premium
    const isPremiumUser = req.session.user && req.session.user.rol === "premium";
    //console.log(`es premiun ${isPremiumUser}`)
    //console.log(product.owner)
    //console.log(req.session.user.email)
    // Verificar si el producto pertenece al usuario premium
    if (isPremiumUser && product.owner.toLowerCase() == req.session.user.email.toLowerCase()) {
      return res.status(403).json({ status: "error", message: "Premium users cannot add their own products to the cart" });
    }    

    // Agregar el producto al carrito
    const result = await cartRepository.addProductToCart(cid, pid, quantity);
    
    logger.info('Product added successfully', { result });
    res.json({ message: 'Producto agregado al carrito exitosamente' });
  } catch (error) {
    logger.error('Error while adding product', error);
    return res.status(400).json({ status: "error", message: "Cannot add product: " + error });
  }
};

const deleteProductFromCart = async(req,res)=>{
    try {
      const { cid, pid } = req.params;
      const cart = await cartRepository.getById(cid);
      
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }
      const product = await productRepository.getById(pid);
      
      if (!product) {
        return res.status(404).json({ error: 'El producto no existe' });
      }
      const productIndex = cart.products.findIndex((p) => p.product.equals(product._id));
      
      if (productIndex === -1) {
        return res.status(404).json({ error: 'El producto no existe en el carrito '  + productIndex});
      }
  
      cart.products.splice(productIndex, 1);
      await cart.save();
      logger.info('product deleted successfully'); 
      res.json({ message: 'Producto eliminado del carrito exitosamente' });
    } catch (error) {
      logger.error('Error while deleting product from cart', error);       
      res.status(500).json({ error: 'Error al eliminar el producto del carrito ' + error });
    }}

const updateCart=async (req, res) => {
    try {
      const { cid } = req.params;
      const { products } = req.body;
      
      const cart = await cartRepository.getById(cid);
      
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }
      
      cart.products = products;
      await cart.save();
      logger.info('cart updated successfully'); 
      res.json({ message: 'Carrito actualizado exitosamente' });
    } catch (error) {
      logger.error('Error while updating cart', error);       
      res.status(500).json({ error: 'Error al actualizar el carrito: '+error });
    }
  }

const updateProductInCart= async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
  
      // Obtener el carrito
      const cart = await cartRepository.getById(cid);
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }
      const product = await productRepository.getById(pid);
      if (!product) {
        return res.status(404).json({ error: 'El producto no existe' });
      }
      const productIndex = cart.products.findIndex((p) => p.product.equals(product._id));
  
      if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      }
  
      // Actualizar la cantidad del producto
      cart.products[productIndex].quantity = quantity;
  
      // Guardar los cambios en el carrito
      await cart.save();
      logger.info('product updated successfully'); 
      res.json({ message: 'Cantidad de ejemplares del producto actualizada exitosamente' });
    } catch (error) {
      logger.error('Error while updating product in cart', error);       
      res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito' + error });
    }
  }

const deleteCart =async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await cartRepository.getById(cid);
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }
      
      // Vaciar el arreglo de productos del carrito
      cart.products = [];
      
      // Guardar los cambios en el carrito
      await cart.save();
      logger.info('cart deleted successfully'); 
      return res.json({ message: 'Productos eliminados del carrito exitosamente' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar los productos del carrito' });
    }
  }
  const finalizePurchase = async (req, res) => {
    try {
      const { cid } = req.params;
  
      // Verificar si el usuario está autenticado en la sesión
      if (!req.session.user) {
        return res.status(401).json({ status: 'error', message: 'Not authenticated' });
      }
  
      // Obtener el carrito
      const cart = await cartRepository.getById(cid);
  
      // Verificar si el carrito existe y pertenece al usuario
      if (!cart || cart.user.toString() !== req.session.user._id) {
        return res.status(404).json({ status: 'error', message: 'Cart not found or does not belong to the user' });
      }
  
      // Verificar si el carrito está vacío
      if (cart.products.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Cart is empty' });
      }
  
      // Filtrar los productos que no pudieron comprarse y actualizar el carrito
      const productsToPurchase = cart.products;
      const productsNotPurchased = [];

      for (const productToPurchase of productsToPurchase) {
        const product = await productRepository.getById(productToPurchase.product);
        if (!product || product.stock < productToPurchase.quantity) {
          // No se pudo comprar, agregarlo a la lista de productos no comprados
          productsNotPurchased.push(productToPurchase.product);
          break;
        } else {
          // Restar el stock solo si el producto se puede comprar
          product.stock -= productToPurchase.quantity;
        }
        await product.save();

      }
      
      if (productsNotPurchased.length > 0) {
        // Algunos productos no se pudieron comprar
        const error = createError(INSUFFICIENT_STOCK);
        return res.status(400).json({
          status: 'error',
          message: 'No hay suficiente stock de algunos productos ',
          productsNotProcessed: productsNotPurchased,
          error
        });
      }
      // Crear el ticket y responder al cliente
      const newTicket = await createTicket(productsToPurchase, cart.user);
      req.session.newTicket = newTicket;
      await cartRepository.delete(cid)
      res.status(200).json({ status: 'success', message: 'Purchase completed successfully', ticket: newTicket });
  
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error ' + error });
    }
  };

  function generateUniqueCode() {
    // Aquí implementa la generación de un código único, por ejemplo, usando la fecha y algún valor aleatorio
    const timestamp = new Date().getTime();
    const randomValue = Math.floor(Math.random() * 10000);
    return `TICKET-${timestamp}-${randomValue}`;
  }

  function calculateTotalAmount(productsToPurchase) {
    let totalAmount = 0;
  
    for (const product of productsToPurchase) {
      const productPrice = product.product.price;
      const quantity = product.quantity;
      totalAmount += productPrice * quantity;
    }
    return totalAmount;
  }

  async function createTicket(productsToPurchase, purchaser ) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const ticketData = {
        code: generateUniqueCode(), // Implementa la generación de un código único
        purchase_datetime: new Date(),
        amount: calculateTotalAmount(productsToPurchase),
        purchaser: purchaser,
        products: [],
      };
  
      const ticket = await ticketsManager.createTicket(ticketData);
      ticket.products = []; 

      for (const productToPurchase of productsToPurchase) {
        const product = await productRepository.getById(productToPurchase.product);
  
        if (!product || product.stock < productToPurchase.quantity) {
          throw new Error(`Product stock is insufficient for product ${product._id}`);
        }
        await product.save();
        ticket.products.push({
          product: productToPurchase.product,
          quantity: productToPurchase.quantity,
          unit_price: product.price,
        });
      }
      console.log(ticket);
      //await cartRepository.cleanCart(cartId);
      await ticket.save();
      await session.commitTransaction();
      session.endSession();
  
      return ticket;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  
export {
    getCartById,
    createCart,
    addProductToCart,
    deleteProductFromCart,
    updateCart,
    updateProductInCart,
    deleteCart,
    finalizePurchase
}