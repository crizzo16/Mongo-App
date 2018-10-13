let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let ArticleSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        unique: true
    },
    imgSrc: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        unique: true
    },
    comments: [{
        type: Schema.ObjectId,
        ref: "Comment"
    }]
});

// Creates the model from the schema
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;