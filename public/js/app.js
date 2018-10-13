$(document).on("click", ".scrape-articles", function() {
  //console.log("bonjour");
  $.get("/scrape").then(function(data) {
    //console.log("uo");
    //console.log(data[0]);
    location.reload();
    return data;
  });
});

$(document).on("click", ".card", function() {
  $("#comments-here").empty();

  const articleId = $(this).attr("data-id");
  console.log(articleId);
  if ($(this).hasClass("selected")) {
    $(this).removeClass("selected");
    $(".card").css("opacity", "1");
    $("#submit").addClass("disabled");
    //$("#article-title").attr("data-id", "");
  } else {
    $(".card").css("opacity", "0.5");
    $(this).css("opacity", "1");
    $(".card").removeClass("selected");
    $(this).addClass("selected");
    $("#submit").removeClass("disabled");
    $("#article-title").attr("data-id", articleId);
  }

  $.ajax({
    method: "GET",
    url: "/articles/" + articleId
  }).then(function(data) {
    // Debugging
    console.log("**************************************");
    //console.log(data);
    // I tried doing this with handlebars, I really did. But it's hard to send this data back server-side and render it.
    console.log(data.comments[0]);
    console.log(data.comments[0].name);
    console.log(data.comments.length);
    for (let i = 0; i < data.comments.length; i++) {
      let row = $("<div>")
        .addClass("row hcomment valign-wrapper")
        .attr("id", data.comments[i]._id);
      let col2 = $("<div>").addClass("col s2 valign-wrapper h100");
      let h = $("<h6>")
        .addClass("truncate")
        .html("<strong>" + data.comments[i].name + "</strong>");
      col2.append(h);
      let col1 = $("<div>").addClass("col s1 valign-wrapper h100");
      let x = $("<h6>")
        .text("X")
        .attr("data-id", data.comments[i]._id)
        .addClass("hover-red remove-comment");
      col1.append(x);
      let col9 = $("<div>").addClass("col s9 valign-wrapper h100");
      let p = $("<p>")
        .addClass("truncate")
        .text(data.comments[i].body);
      col9.append(p);
      let divider = $("<div>").addClass("divider");
      row.append(col2, col9, col1);
      $("#comments-here").append(row);
      if (i < data.comments.length - 1) {
        $("#comments-here").append(divider);
      }
    }
  });
});

$(document).on("click", ".remove-comment", function(event) {
  const commentId = $(this).attr("data-id");
  const commentLineId = "#" + commentId;
  $(commentLineId).remove();
  $.ajax({
    method: "DELETE",
    url: "/comments/" + commentId
  }).then(function(returnData) {
    console.log("deleted comment");
    console.log(returnData);
  });
});

$(document).on("click", "#submit", function(event) {
  event.preventDefault();

  const articleId = $("#article-title").attr("data-id");
  const commentData = {
    name: $("#name")
      .val()
      .trim(),
    body: $("#body")
      .val()
      .trim()
  };
  //console.log("************************");
  //console.log(articleId);

  $.ajax({
    method: "POST",
    url: "/articles/" + articleId,
    data: commentData
  }).then(function(returnData) {
    //console.log("########################################");
    //console.log(returnData);
    let divider = $("<div>").addClass("divider");
    let row = $("<div>")
      .addClass("row hcomment valign-wrapper")
      .attr("id", returnData.comments[returnData.comments.length - 1]._id);
    let col2 = $("<div>").addClass("col s2 valign-wrapper h100");
    let h = $("<h6>")
      .addClass("truncate")
      .html(
        "<strong>" +
          returnData.comments[returnData.comments.length - 1].name +
          "</strong>"
      );
    col2.append(h);
    let col1 = $("<div>").addClass("col s1 valign-wrapper h100");
    let x = $("<h6>")
      .text("X")
      .attr("data-id", returnData.comments[returnData.comments.length - 1]._id)
      .addClass("hover-red remove-comment");
    col1.append(x);
    let col9 = $("<div>").addClass("col s9 valign-wrapper h100");
    let p = $("<p>")
      .addClass("truncate")
      .text(returnData.comments[returnData.comments.length - 1].body);
    col9.append(p);
    row.append(col2, col9, col1);
    if (returnData.comments.length > 1) {
      $("#comments-here").append(divider, row);
    } else {
      $("#comments-here").append(row);
    }

    $("#name").val("");
    $("#body").val("");
  });
});
