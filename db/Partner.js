const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
        name:{
            type : String,
            required : true,
        },
        email:{
            type : String,
            required : true,
            lowercase : true,
            unique : true
        },
        password:{
            type : String,
            required : true
        }
    }
);

module.exports = mongoose.model("partner", partnerSchema);