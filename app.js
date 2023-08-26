//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const  _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://jainthakhil16:jainthakhil16@cluster0.4ecqvdp.mongodb.net/TodoListDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const first = new Item ({
  name: "Hit + to Add"

// const defaultItems = [first, second, third];
const defaultItems = [first];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);


//finding--
app.get("/", function(req,res){
  Item.find()
  .then(function(items){
    res.render("list", {listTitle: "Today", newListItems: items});
  })
  .catch(function(err){
    console.log(err);
  })
  
});

// adding new item--
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });
  // console.log(req.body.list);

  if(listName === "Today"){
    item.save();
    res.redirect("/");
    
  } else {
    List.findOne({name:listName})
    .then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    })
  }
});


//delete items from list--

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      // console.log(checkedItemId + "item deleted");
      res.redirect("/");
    })
    .catch(function(err){
      console.log(err);
    });

  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then((foundList, err) => {
      if(!err){
        res.redirect("/" + listName);
      }

    })

  }

})


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName})
  .then((listInfo) => {
    if (listInfo) {
      // console.log('Collection exists');
      res.render("list", {listTitle: listInfo.name, newListItems: listInfo.items});
      
    } else {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
      // console.log('Collection does not exist');
    }
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
