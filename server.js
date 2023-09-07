require("./db/config");
require("dotenv").config()
const express = require("express");
const cors = require("cors");
const Partner = require("./db/Partner");
const Product = require("./db/Products");
const Products = require("./db/Products");
const Jwt = require("jsonwebtoken");
const Bcrypt = require("bcrypt");

const app = express();

const JwtKey = process.env.SECRET_KEY;
const saltRound = 10;

app.use(cors());

app.use(express.json());

app.set("view engine", "ejs");

function verifyToken(req, res, next) {
    const token = req.headers.authorization;
    if (token) {
        Jwt.verify(token, JwtKey, (error, valid) => {
            if (error) {
                res.status(401).send("Please provide valid token");
            } else {
                next()
            }
        })
    } else {
        res.status(403).send("Please add token with header");
    }
}

app.post("/e_shop-partner/register", (req, res) => {
    // Recieve data from client
    const pName = req.body.name;
    const pEmail = req.body.email;
    const pPassword = req.body.password;
    Bcrypt.hash(pPassword, saltRound, (error, hashed) => {
        const partner = new Partner({
            name: pName,
            email: pEmail,
            password: hashed
        });
        partner.save().then((result) => {
            // Delete password from response
            result = result.toObject();
            delete result.password;
            Jwt.sign({ result }, JwtKey, { expiresIn: "7d" }, (error, token) => {
                if (error) {
                    res.send("Something went wrong!")
                }
                res.send({ result, auth: token });
            })
        }).catch((error) => {
            res.send(error)
        });
    })
});

app.post("/e_shop-partner/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    Partner.findOne({ email }).then((user) => {
        if (!user) {
            res.send({code : 400});
        }
        Bcrypt.compare(password, user.password, (error, data) => {
            if (data) {
                user = user.toObject();
                delete user.password;
                Jwt.sign({ user }, JwtKey, { expiresIn: "7d" }, (error, token) => {
                    if (error) {
                        res.send("Somthing went wrong!")
                    }
                    res.send({ user, auth: token });
                });
            } else {
                res.send({code : 401});
            }

            if(error){
                res.send({code : 401});
            }
        })
    })
});

app.post("/e_shop-partner/add-product", verifyToken, (req, res) => {
    const productInfo = req.body;
    const product = new Product({
        userID: productInfo.userID,
        imageLink: productInfo.imageLink,
        userName: productInfo.userName,
        modelName: productInfo.modelName,
        company: productInfo.company,
        category: productInfo.category,
        price: productInfo.price,
        description: productInfo.description
    });

    product.save().then((result) => {
        res.send(result);
    }).catch((error) => {
        res.send(error);
    });
});

app.get("/e_shop-partner/products", verifyToken, (req, res) => {
    Product.find({ userID: req.query.id }).then((result) => {
        console.log(result)
        res.send(result)
    });
});

app.delete("/e_shop-partner/delete/:id", verifyToken, (req, res) => {
    Product.deleteOne({ _id: req.params.id }).then((response) => {
        res.send(response);
    });
});

app.get("/e_shop-partner/update/:id", verifyToken, (req, res) => {
    Product.findOne({ _id: req.params.id }).then((response) => {
        res.send(response);
    });
});

app.put("/e_shop-partner/update/:id", verifyToken, (req, res) => {
    const data = req.body;
    Product.updateOne({ _id: req.params.id }, {
        $set: {
            imageLink: data.imageLink,
            modelName: data.modelName,
            company: data.company,
            category: data.category,
            price: data.price,
            description: data.description
        }
    }).then((response) => {
        res.send(response);
    });
});

app.get("/e_shop-partner/search/:key", verifyToken, (req, res) => {
    Product.find({
        userID: req.query.id,
        $or: [
            { modelName: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { description: { $regex: req.params.key } }
        ]
    }).then((response) => {
        res.send(response);
    });
});

app.listen(4000, () => {
    console.log("Server is running on port : 4000");
});