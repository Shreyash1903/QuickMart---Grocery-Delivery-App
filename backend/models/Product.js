import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },

    category:{
        type:String,
        required:true
    },

    image:{
        type:String,
        required:true
    },

    price:{
        type:Number,
        required:true
    },

    discountPrice:{
        type:Number,
        default:0
    },

    quantity:{
        type:String,
        required:true
    },

    description:{
        type:String,
        default:""
    },

    stock:{
        type:Number,
        default:0
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

},
{
    timestamps:true
});

// Create the Product model
const ProductModel = mongoose.model("Product",productSchema);

export default ProductModel;