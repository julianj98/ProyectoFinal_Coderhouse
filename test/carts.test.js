import chai from "chai"
import supertest from 'supertest';

const expect = chai.expect

const requester = supertest("http://localhost:8080")

describe("Carts Router", () => {
  
    // Prueba para la ruta GET /api/carts/:id
    describe('GET /api/carts/:id', () => {
      it('debería obtener un carrito por ID', async () => {
        // Supongamos que tienes un ID válido de carrito para esta prueba
        const CartId = '650cfaa4407228f1e4415cda'; 
        const response = await requester.get(`/api/carts/${CartId}`);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object'); 
      });
      describe('PUT /:cid/products/:pid', () => {

      it('debería actualizar la cantidad de un producto en el carrito si existe', async () => {
        // Supongamos que tienes un ID de carrito (`cid`) y un ID de producto (`pid`) válidos para esta prueba
        const cid = '650cfaa4407228f1e4415cda';
        const pid = '650cfa69407228f1e4415cc1';
  
        // Supongamos que deseas actualizar la cantidad a un nuevo valor
        const nuevaCantidad = 5;
  
        // Realiza una solicitud PUT para actualizar la cantidad del producto en el carrito
        const response = await requester
          .put(`/api/carts/${cid}/products/${pid}`)
          .send({ quantity: nuevaCantidad });
  
        // Verifica que la respuesta tenga el código de estado esperado (por ejemplo, 200 si se actualizó con éxito)
        expect(response.status).to.equal(200);
        // Verifica que la respuesta tenga el formato esperado
        expect(response.body).to.be.an('object');
        // Verifica que el mensaje de la respuesta sea el esperado
        expect(response.body.message).to.equal('Cantidad de ejemplares del producto actualizada exitosamente');
      });
    });
  
      describe('DELETE /:cid/products/:pid', () => {
        it('debería eliminar un producto del carrito si existe', async () => {
          // Supongamos que tienes un ID de carrito (`cid`) y un ID de producto (`pid`) válidos para esta prueba
          const cid = '650cfaa4407228f1e4415cda';
          const pid = '650cfa69407228f1e4415cc1';
    
          // Realiza una solicitud DELETE para eliminar el producto del carrito
          const response = await requester.delete(`/api/carts/${cid}/products/${pid}`);
    
          // Verifica que la respuesta tenga el código de estado esperado (por ejemplo, 200 si se eliminó con éxito)
          expect(response.status).to.equal(200);
          // Verifica que la respuesta tenga el formato esperado
          expect(response.body).to.be.an('object');
          // Verifica que el mensaje de la respuesta sea el esperado
          expect(response.body.message).to.equal('Producto eliminado del carrito exitosamente');
        });
      });


    });
  });
      