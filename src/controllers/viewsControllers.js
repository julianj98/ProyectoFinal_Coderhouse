import express from "express";
import mongoosePaginate from 'mongoose-paginate-v2';
import ProductsManager from "../dao/mongo/manager/products.js";
import CartsManager from "../dao/mongo/manager/carts.js";
import Handlebars from 'handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import userModel from '../dao/mongo/models/user.js';


const router = express.Router();

const productsManager = new ProductsManager();
const cartManager = new CartsManager();

const renderProductsPage = async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
  
    // Obtener la lista de productos paginados desde el gestor de productos
    const { products, totalPages, currentPage, totalProducts } = await productsManager.getProductsPaginated(limit, page);
    
    // Obtener los datos del usuario si existe una sesión activa
    const user = req.session.user;
    let cart = null;
    let cartId = null; // Inicializa cartId como null

    if (user) {
      // Si el usuario está autenticado, intenta obtener su carrito a través de la referencia "user"
      cart = await cartManager.getCartByUser(user);
  
      // Si el carrito existe, asigna su _id a cartId
      if (cart) {
        cartId = cart._id;
      }
    }
    // Calcular los enlaces de paginación
    const prevLink = currentPage > 1 ? `/products?limit=${limit}&page=${parseInt(page) - 1}` : null;
    const nextLink = currentPage < totalPages ? `/products?limit=${limit}&page=${parseInt(page) + 1}` : null;
    
    // Renderizar la vista products.handlebars con los datos de los productos y la paginación
    res.render("products", { products, totalPages, currentPage, totalProducts, prevLink, nextLink,user, cart, cartId  });
  }

const renderCartPage = async(req,res)=>{
    const cartId = req.params.cid;
  
    // Obtener el carrito específico utilizando el gestor de carritos
    const cart = await cartManager.getCart(cartId);
  
    // Verificar si el carrito existe
    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }
  
    // Obtener los productos asociados al carrito
    const products = await cartManager.getCartProductsWithQuantity(cartId);
    const totalCartPrice = products.reduce((total, product) => {
      return total + product.product.price * product.quantity;
    }, 0);
    // Renderizar la vista cart.handlebars con los datos del carrito y los productos
    res.render("cart", { cart, products,totalCartPrice });
  }

const renderProfilePage =  (req, res) => {
    // Verificar si el usuario está autenticado (si existe req.session.user)
    if (req.session.user) {
      // Si está autenticado, renderizar la vista profile.handlebars con los datos del usuario
      res.render('profile', {
        user: req.session.user
      });
    } else {
      // Si no está autenticado, redirigirlo a la página de inicio de sesión (login)
      res.redirect('/login');
    }
  }
const renderModifyUser = async (req,res)=>{
  try {
    // Obtener la lista de usuarios desde la base de datos
    const users = await userModel.find({}, 'first_name last_name email rol');

    // Renderizar la vista con los datos de los usuarios
    res.render('users', { users });
  } catch (error) {
    console.error('Error al obtener la lista de usuarios:', error);
    // Manejar el error
    res.status(500).send('Error al obtener la lista de usuarios');
  }
};

const viewUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId; // Obtener el ID del usuario desde los parámetros de la ruta
    
    // Buscar el usuario por su ID en la base de datos
    const user = await userModel.findById(userId);

    if (!user) {
      // Manejar el caso en que el usuario no se encuentre
      res.status(404).send('Usuario no encontrado');
    } else {
      // Renderizar una vista que muestre los detalles del usuario
      res.render('user', { user });
    }
  } catch (error) {
    console.error('Error al ver los detalles del usuario:', error);
    res.status(500).send('Error al ver los detalles del usuario');
  }
};

const modifyUserRole = async (req, res) => {
  try {
    const userId = req.params.userId; // Obtener el ID del usuario desde los parámetros de la ruta
    const newRole = req.body.newRole; // Obtener el nuevo rol desde el cuerpo de la solicitud

    // Validar que el nuevo rol sea "user" o "premium"
    if (newRole !== 'user' && newRole !== 'premium') {
      res.status(400).send('El nuevo rol debe ser "user" o "premium"');
      return;
    }

    // Buscar el usuario por su ID en la base de datos
    const user = await userModel.findById(userId);

    if (!user) {
      // Manejar el caso en que el usuario no se encuentre
      res.status(404).send('Usuario no encontrado');
    } else {
      // Modificar el rol del usuario
      user.rol = newRole;

      // Guardar los cambios en la base de datos
      await user.save();

      // Redirigir a la página de detalles del usuario o a donde desees
      res.redirect(`/admin/users/${userId}`);
    }
  } catch (error) {
    console.error('Error al modificar el rol del usuario:', error);
    res.status(500).send('Error al modificar el rol del usuario');
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId; 

    const result = await userModel.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      // Manejar el caso en que el usuario no se encuentre
      res.status(404).send('Usuario no encontrado');
    } else {
      // Redirigir a la página de administración de usuarios o a donde desees
      res.redirect('/admin/users');
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).send('Error al eliminar el usuario');
  }
};
const renderPurchaseConfirmation = async (req, res) => {
  try {
    const newTicket = req.session.newTicket; // Obtener el ticket almacenado en la sesión

    if (!newTicket) {
      // Manejar el caso en el que el ticket no esté disponible en la sesión
      res.status(404).send('Ticket no encontrado');
      return;
    }
    // Busca el nombre del comprador usando el ID del comprador
    const purchaser = await userModel.findById(newTicket.purchaser);

    if (!purchaser) {
      // Manejar el caso en el que el comprador no se encuentre
      res.status(404).send('Comprador no encontrado');
      return;
    }

    // Renderiza la vista purchase-confirmation con los datos del ticket
    res.render("purchase-confirmation", { ticket: newTicket, purchaserName: purchaser.first_name +" "+ purchaser.last_name });
  } catch (error) {
    console.error('Error en renderPurchaseConfirmation:', error);
    res.status(500).send('Error en renderPurchaseConfirmation');
  }
};


export {
    renderProductsPage,
    renderCartPage,
    renderProfilePage,
    renderModifyUser,
    viewUserDetails,
    modifyUserRole,
    deleteUser,
    renderPurchaseConfirmation
}