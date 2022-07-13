const express = require("express");
const https = require("https");
var ejs = require('ejs');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _ = require("lodash");
/***********************************************/
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoDB", {
  useNewUrlParser: true
});
/***********************************************/
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nome é obrigatório"]
  }
});
const Item = mongoose.model("Item", itemsSchema)

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.mongoose.model("List", listSchema);
/***********************************************/
const item1 = new Item({
  name: "Welcome"
});

const item2 = new Item({
  name: "Hit the + button do add new itens"
});

const item3 = new Item({
  name: "Hit the checkbox to delete an item"
});

const defaultItem = [item1, item2, item3];
/***********************************************/
app.get("/", function (req, res) {

  let currentDay = date.getDateformatted();

  Item.find({}, function (err, result) {
    if (err) {
      console.log(err);
      res.render("list", {
        ListTitle: currentDay,
        items: []
      });
    } else {
      if (result.length === 0) {
        Item.insertMany(defaultItem, function (err) {
          if (err) {
            console.log(err);
          }
        });
        res.render("list", {
          ListTitle: currentDay,
          items: defaultItem,
          List: "main"
        });
      }
      res.render("list", {
        ListTitle: currentDay,
        items: result,
        List: "main"
      });
    }
  });

})

app.get("/:listaName", function (req, res) {
  const listName = _.capitalize(req.params.listaName);

  let currentDay = date.getDateformatted();

  List.findOne({
    name: listName
  }, function (err, result) {
    if (!err) {
      if (!result) {
        const list = new List({
          name: listName,
          items: defaultItem
        })

        list.save();

        res.render("list", {
          ListTitle: currentDay + ' - ' + listName,
          items: defaultItem,
          List: listName
        })
      } else {
        res.render("list", {
          ListTitle: currentDay + ' - ' + result.name,
          items: result.items,
          List: result.name
        })
      }
    }
  })
})


/***********************************************/
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const list = req.body.list;

  const addItem = new Item({
    name: itemName
  });

  if (list === "main") {
    addItem.save();

    res.redirect("/");
  } else {
    List.findOne({
      name: list
    }, function (err, result) {
      result.items.push(addItem);

      result.save();

      res.redirect("/" + list);
    })
  }




})

app.post("/delete", function (req, res) {
  const listName = req.body.listName;

  if (listName === "main") {
    Item.findByIdAndRemove(req.body.checkbox, function (err) {
      if (err) {
        console.log(err);
      }
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: req.body.checkbox}}}, function(err, result){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

/***********************************************/

app.listen(process.env.PORT || 80, function () {
    console.log("Server iniciado na porta 80");
  })