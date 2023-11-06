import mongoose from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2';
import userModel from "./user.js"; // Asegúrate de que la importación del modelo de usuario sea correcta


const productCollection = "products"
//title, description, code, price, status = true, stock, category, thumbnail
const productSchema= new mongoose.Schema({
    title: String,
    description: String,
    code: {
        type:String,
        unique:true,
    },
    price: Number,
    status:Boolean,
    stock:Number,
    category:String,
    thumbnail:String,
    owner: {
        type: String,
        default: 'admin',
    },
})
productSchema.plugin(mongoosePaginate);

const productModel= mongoose.model(productCollection,productSchema)
export default productModel