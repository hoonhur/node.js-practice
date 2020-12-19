let http = require("http");
let fs = require("fs");
let url = require("url");
let qs = require("querystring");

function templateHTML(product, list, body) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>SOM Accessories ${product}</title>
      <link rel="stylesheet" type="text/css" href="main.css">
    </head>
    <body>
      <h1><a href="/">SOM Accessories</a></h1>
      <div id="grid">
        ${list}
        <a href='/add'>Add</a>
        ${body}
      </div>
    </body>
  </html>
    `;
}

function templateList(filelists) {
  let list = "<ul>";
  for (file of filelists) {
    list = list + `<li><a href='/?id=${file}'>${file}</a></li>`;
  }
  list = list + "</ul>";
  return list;
}

let app = http.createServer(function (request, response) {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (err, filelists) => {
        let product = "welcome";
        let description = "SOM Accessory is...";
        let list = templateList(filelists);
        let template = templateHTML(
          product,
          list,
          `<div id="article">
        <h2>${product}</h2>
        <p>${description}</p>
      </div>`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("./data", (err, filelists) => {
        fs.readFile(`data/${queryData.id}`, "utf8", function (
          err,
          description
        ) {
          let product = queryData.id;
          let list = templateList(filelists);
          let template = templateHTML(
            product,
            list,
            `<div id="article">
          <h2>${product}</h2>
          <p>${description}</p>
        </div>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathname === "/add") {
    fs.readdir("./data", (err, filelists) => {
      let product = "Product-add";
      let list = templateList(filelists);
      let template = templateHTML(
        product,
        list,
        `<form action="http://localhost:3000/add_process" method="post">
        <p><input type="text" name="product" placeholder='product' /></p>
        <p>
          <textarea name="description" placeholder='description'></textarea>
        </p>
        <p>
          <input type="submit" />
        </p>
      </form>
      `
      );
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === "/add_process") {
    let body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on("end", () => {
      let post = qs.parse(body);
      let product = post.product;
      let description = post.description;
      fs.writeFile(`data/${product}`, description, "utf8", (err) => {
        response.writeHead(302, { Location: `/?id=${product}` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
