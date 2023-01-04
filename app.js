//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const cors = require("cors");
const mongoose = require("mongoose");
const _ = require("lodash");

const PORT = process.env.PORT;
const DBUSER = process.env.DBUSER;
const DBPASS = process.env.DBPASS;

const homeStartingContent = "Welcome to your Personal Journal.\nIn order to make posts go to " ;
const aboutContent = "This is the best personal journal website you'll ever find.";
const contactContent = "An AI created this website. Contacts are undefined :)";

const dbURL = `mongodb+srv://${DBUSER}:${DBPASS}@cluster0.sksiy2a.mongodb.net`;
const dbName = "dailyJournalDB";

mongoose.connect(dbURL + "/" + dbName, {useNewUrlParser: true});

const postSchema = new mongoose.Schema({
  title: String,
  post: String
});

const Post = mongoose.model("Post", postSchema);

const app = express();

// Use EJS Templates
app.set('view engine', 'ejs');

// Allow the server to read request body and use static files
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

app.use(cors());
// GET route for '/' path
app.get("/", (req, res) => {

  Post.find({}, (err, foundItems) => {
    if (err)
    {
      res.send(err);
    }
    else
    {
      res.render("home", {homeCont: homeStartingContent, userPosts: foundItems});
    }
  });
});

// GET route for '/contact' path
app.get("/contact", (req, res) => {
  res.render("contact", {contactCont: contactContent});
});

// GET route for '/about' path
app.get("/about", (req, res) => {
  res.render("about", {aboutCont: aboutContent});
});

// GET route for '/compose' path
app.get("/compose", (req, res) => {
  res.render("compose");
});

// GET route for '/posts' path
app.get("/posts/:postName", (req, res) => {
  const {postName} = req.params;

  Post.findOne({title: _.lowerCase(postName)}, 'title post', (err, postObj) => {
    if (err)
    {
      res.send(err);
    }
    else
    {

      if (postObj !== null)
      {
          res.render("post", {title: postObj.title, post: postObj.post});

      }

      else
      {
        res.redirect("/");
      }
    }
  });
});


//POST route for '/compose' path
app.post("/compose", (req, res) => {
  const {title, post} = req.body;

  Post.create({title: _.lowerCase(title), post: post}, err => {
    if (err)
    {
      res.send(err);
    }
    else
    {
      res.redirect("/");
    }
  });
});

// POST route for '/delete' path
app.post("/delete",(req, res) => {
  
  const {name} = req.body;

  Post.deleteOne({title: _.lowerCase(name)}, err => {
    if (err)
    {
      res.send(err);
    }

    else
    {
      res.redirect("/");
    }
  });

});

// Start out the server
app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
});
