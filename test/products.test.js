import chai from "chai"
import supertest from 'supertest';

const expect = chai.expect

const requester = supertest("http://localhost:8080")

// Describe el conjunto de pruebas para el enrutador de productos
describe("Products Router", () => {
    
  // Define un objeto de producto de ejemplo para las pruebas
  const sampleProduct = {
    title: "Producto de prueba",
    description: "Descripción de prueba",
    code: "PR001",
    price: 99.99,
    status: true,
    stock: 10,
    category: "test",
    thumbnail: "imagen.jpg",
  };

  let productId;

  // Prueba para la ruta GET /api/products
  describe("GET /api/products", () => {
    it("debería obtener una lista de productos", async () => {
      const response = await requester.get("/api/products");
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("object"); // Verifica que sea un objeto
      expect(response.body.status).to.equal("success"); // Verifica el valor de la propiedad "status"
      expect(response.body.payload).to.be.an("array"); // Verifica que "payload" sea un arreglo
    });
  });

  // Prueba para la ruta POST /api/products
  describe("POST /api/products", () => {
    it("debería crear un nuevo producto como administrador", async () => {
        // Simular un usuario autenticado con rol "admin"
        const authenticatedUser = {
          name: "Admin User",
          email: "adminCoder@coder.com",
          rol: "admin",
        };
      
        // Configura el usuario en la sesión
        requester 
          .post("/api/sessions/login") // Iniciar sesión para configurar el usuario en la sesión
          .send({ email: authenticatedUser.email, password: "password" }) 
          .expect(200) 
          .end(async (loginErr) => {
            if (loginErr) {
              throw loginErr;
            }
      
            // Realiza la solicitud POST con el usuario autenticado
            const response = await requester
              .post("/api/products")
              .send(sampleProduct);
      
            // Verifica que se haya creado el producto exitosamente
            expect(response.status).to.equal(201);
            expect(response.body).to.be.an("object");
            expect(response.body.title).to.equal(sampleProduct.title);
      

          });
      });
      
    it("debería bloquear la creación de un producto como usuario no autenticado", async () => {
      // Realiza la solicitud POST sin usuario autenticado
      const response = await requester
        .post("/api/products")
        .send(sampleProduct);

      // Verifica que se haya bloqueado la creación del producto
      expect(response.status).to.equal(403);
      expect(response.body).to.be.an("object");
      expect(response.body.status).to.equal("error");
      expect(response.body.message).to.equal("Access forbidden");
    });
  });

  // Prueba para la ruta GET /api/products/:id
  describe("GET /api/products/:id", () => {

    it("debería obtener un producto por ID", async () => {
      productId =  "64a395b191369e26cb24e4eb"
      const response = await requester.get(`/api/products/${productId}`);
      expect(response.status).to.equal(200);
    });
  });

});
