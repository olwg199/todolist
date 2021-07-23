//jshint esversion:6
require("dotenv").config();

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require('lodash.capitalize');

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = {
    name: {
        type: String,
        required: true
    }
};

const listSchema = {
    name: {
        type: String,
        reqired: true
    },
    items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

app.get("/:category?", function (req, res) {
    const todayDate = new Date().toISOString().slice(0, 10);
    let listName = _(req.params.category);
    if (!listName) listName = todayDate;

    List.findOne({ name: listName }, (err, list) => {
        if (list) {
            //Show an existing list
            res.render("list", { listTitle: list.name, newListItems: list.items, formUrl: "/" + list.name });
        } else {
            //Create a default list
            new List({
                name: listName,
                items: defaultItems
            }).save();

            res.redirect("/" + listName);
        }
    });
});

app.post("/delete", (req, res) => {
    const id = req.body.checkbox;
    let listName = _(req.body.listName);

    List.findOneAndUpdate({ name: listName },
        { $pull: { items: { _id: id } } },
        (err, results) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
});

app.post("/:category?", (req, res) => {
    const listName = _(req.params.category);
    List.findOne({ name: listName }, (err, list) => {
        list.items.push(new Item({ name: req.body.newItem }));
        list.save().then((result) => {
            res.redirect("/" + listName);
        });
    });
});

app.listen(process.env.PORT || "3000", () => {
    console.log("Server is running on port 3000");
});