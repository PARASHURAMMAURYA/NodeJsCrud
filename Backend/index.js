const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const Products = require("./db/Product");
const jwt = require("jsonwebtoken");
const jwtKey = "e-comm";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
  let user = new User(req.body);
  const result = await user.save();
  result = result.toObject();
  delete result.password;
  res.send(result);
});

app.get("/product", async (req, res) => {
  //let product = new Products(req.body);
  const result = await Products.find(req.body);
  res.send(result);
  console.log(result);
});

app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if(err){
          res.send({ result: "No user Found" });
        }
        res.send({user, auth: token });
      })
    //  res.send(user);
    } else {
      res.send({ result: "No user Found" });
    }
  } else {
    res.send({ result: "No user Found" });
  }
});

app.post("/add-product", async (req, res) => {
  let product = new Products(req.body);
  let result = await product.save();
  res.send(result);
});

app.delete("/delete-product/:_id", async (req, res) => {
  const { _id } = req.params;

  try {
    const result = await Products.deleteOne({ _id });
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.send({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.listen(5000);
