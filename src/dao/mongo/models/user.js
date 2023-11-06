import mongoose from "mongoose";

const collection = "Users";

const documentSchema = new mongoose.Schema({
    name: String,
    reference: String,
  });
  
const schema = new mongoose.Schema({
    first_name:String,
    last_name:String,
    email: { type: String, unique: true }, // Asegúrate de que el campo email sea único
    age: Number, 
    password:String,
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Carts' }, // Agrega la referencia al carrito
    rol: { type: String, default: 'user' },
    resetPasswordToken: String, // Agregar campo para el token de restablecimiento
    resetPasswordExpires: Date,
    documents: [documentSchema],
    last_connection: Date 
})
schema.pre('save', function (next) {
  if (this.isNew || this.isModified('rol')) {
      if (this.email === 'adminCoder@coder.com') {
          this.rol = 'admin';
      } 
  }
  next();
});
schema.methods.updateLastConnection = async function () {
    this.last_connection = new Date();
    await this.save();
  };
  
  
const userModel = mongoose.model(collection,schema);

export default userModel;