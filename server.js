var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 5656;

// Initialize Express
var app = express();

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Connect to the Mongo DB

// if (process.env.MONGODB_URI) {
//   mongoose.connect(process.env.MONGODB_URI);
// } else {
//   mongoose.connect(
//     "mongodb://localhost/mongoScrapeApp",
//     { useNewUrlParser: true }
//   );
// };

const dbConnect = mongoose.connection;
dbConnect.on("error", function (err) {
  console.log("Mongoose Error: ", err);
});

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.buzzfeednews.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children(".newsblock-story-card__info")
        .children("h2")
        .children("a")
        .text();
      result.link = $(this)
        .children(".img-wireframe")
        .children("a")
        .attr("href");
      result.imgSrc = $(this)
        .children(".img-wireframe")
        .children("a")
        .children("img")
        .attr("src");
      result.description = $(this)
        .children(".newsblock-story-card__info")
        .children("p")
        .text();
      console.log(result.title);
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          //return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/", function(req, res) {
  res.render("index");
  /*
  db.Article.find({})
    .then(function(data) {
      //console.log("****************************");
      //console.log(data);
      const articleData = { articles: data.reverse() };
      res.render("index", articleData);
    })
    .catch(function(err) {
      res.render("index", err);
    });*/
});

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function(req, res) {
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "comment",
  // then responds with the article with the comment included
  db.Article.findById(req.params.id)
    .populate("comments")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/comments/:id", function(req, res) {
  db.Comment.remove({_id: req.params.id}, function (err) {
    //location.reload();
  });
});

// Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function(req, res) {
  // save the new comment that gets posted to the Comments collection
  // then find an article from the req.params.id
  // and update it's "comment" property with the _id of the new comment
  db.Comment.create(req.body)
    .then(function(dbComment) {
      //console.log("----------------");
      //console.log(dbComment._id);
      //console.log(req.params.id);
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comments: dbComment._id } },
        { new: true }
      ).populate("comments");
    })
    .then(function(dbArticles) {
      //console.log("**********************");
      //console.log(dbArticles);
      res.json(dbArticles);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
