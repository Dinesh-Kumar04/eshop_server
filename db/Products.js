const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    userID : String,
    imageLink : String,
    userName : String,
    modelName : String,
    company : String,
    category : String,
    price : String,
    description : String
})

module.exports = mongoose.model("products", productSchema);