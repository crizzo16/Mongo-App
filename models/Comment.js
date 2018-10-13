let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let CommentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    body: {
        type: String
    }
});

let Comment = mongoose.model("Comment", CommentSchema);

//Export the Comment model;
module.exports = Comment;