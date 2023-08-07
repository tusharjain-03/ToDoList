const express = require("express");
const bodyParser = require("body-parser");
const md5 = require("md5");


const app = express();

const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Requiring Mongoose Package
const mongoose = require("mongoose");

// Connecting to the mongodb database
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB2",{useNewUrlParser:true});

// Creating a Schema
const usersSchema = new mongoose.Schema({
    username:String,
    password:String,
})

// Creating a model, first parameter is the name of collection, second parameter specifices that it is of type of above mentioned schema
const User = mongoose.model("User",usersSchema);

// Creating a itemSchema
const itemsSchema = new mongoose.Schema({
    username:String,
    todo:String
}) 

// Creating a model, first parameter is the name of collection, second parameter specifices that it is of type of above mentioned schema
const Item = mongoose.model("Item",itemsSchema);

// ROUTE-1: "/" root route or home page of the website
app.get("/",(req,res)=>{
    res.render('signup');
})

// ROUTE-2: "/login" route of the website
app.get("/login",(req,res)=>{
    res.render('login');
})

app.post("/signup",(req,res)=>{
   const username=req.body.email;
   const password=md5(req.body.password);
   const confirmPassword=md5(req.body.passwordConfirm);

   async function findPerson(){
      const person = await User.findOne({username:username});
      if(person){
        res.redirect("/");
      }else{
        if(password===confirmPassword){
          const  user = new User({
            username:username,
            password:password
          })

          user.save();

          const item1=new Item({
            username:username,
            todo:"Welcome to your ToDoList!!"
          })

          const item2=new Item({
            username:username,
            todo:"Hit the + button to add the new item"
          })

          const item3=new Item({
            username:username,
            todo:"<-- Hit this to delete an item"
          })

          item1.save();
          item2.save();
          item3.save();

          res.redirect("/login");
        }else{
           res.redirect("/");
        }
      }
   }
   findPerson();
})

app.post('/login',(req,res)=>{
   const username=req.body.email;
   const password=md5(req.body.password);

    async function findPerson(){
        const person = await User.findOne({username:username});
           if(person && password===person.password){
              const allTodos = await Item.find({username:username})
              res.render("list",{listTitle:"Today",newListItems:allTodos,personId:username})
           }else{
              res.redirect("/login");
           }
    }
    findPerson();
})

app.post("/add",(req,res)=>{
   async function addItem(){
    const newItem=req.body.newItem;
    const username=req.body.personId;
    const item=new Item({
      username:username,
      todo:newItem
    })
    item.save();
 
    const allTodos = await Item.find({username:username})
    res.render("list",{listTitle:"Today",newListItems:allTodos,personId:username})
   }
   addItem();
})

app.post("/delete",(req,res)=>{
    const username=req.body.personId;
    const itemId=req.body.checkbox;
    async function deleteItem(){
       await Item.deleteOne({_id:itemId});
       const allTodos = await Item.find({username:username})
       res.render("list",{listTitle:"Today",newListItems:allTodos,personId:username})
    }
    deleteItem();
})

app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`);
})