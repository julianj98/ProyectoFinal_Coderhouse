import chai from "chai"
import supertest from 'supertest';
const expect = chai.expect

const requester = supertest("http://localhost:8080")
describe("Sessions Router", () => {
    describe("POST /api/sessions/register", () => {
        it("debería registrar un nuevo usuario", async () => {
            const newUser = {
                first_name: "salomon",
                last_name: "rondon",
                email: "rondon1@ejemplo.com",
                age: 25,
                password: "contraseña",
                rol: "user"

            };

            const response = await requester.post("/api/sessions/register").send(newUser);
            //console.log(response);
            expect(response.status).to.equal(200); // Verifica que se haya registrado correctamente
            expect(response.body).to.be.an("object");
            expect(response.body.status).to.equal("success");
            expect(response.body.payload).to.be.an("object");
        });
        const sampleUser = {
            email: "rondon1@ejemplo.com",
            password: "contraseña",
        };

        it("debería iniciar sesión y crear una sesión de usuario válida", async () => {
            const response = await requester
                .post("/api/sessions/login")
                .send(sampleUser);

            // Verifica que se haya iniciado sesión correctamente
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an("object");
            expect(response.body.status).to.equal("success");

        });
        
        it("debería cerrar la sesión de usuario y devolver un mensaje de éxito", async () => {
            const response = await requester.post("/api/sessions/logout");
        
            // Verifica que se haya cerrado la sesión correctamente
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an("object");
            expect(response.body.status).to.equal("Success");
            expect(response.body.message).to.equal("Logout successful");
          });
    });
});