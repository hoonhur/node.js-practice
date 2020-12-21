let http = require("http");
let fs = require("fs");
let url = require("url");
let qs = require("querystring");

let template = {
  HTML: function (product, list, body, control) {
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
          ${control}
          ${body}
        </div>
      </body>
    </html>
      `;
  },
  list: function (filelists) {
    let list = "<ul>";
    for (file of filelists) {
      list = list + `<li><a href='/?id=${file}'>${file}</a></li>`;
    }
    list = list + "</ul>";
    return list;
  },
};

let app = http.createServer((request, response) => {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (err, filelists) => {
        let product = "welcome";
        let description = "SOM Accessory is...";
        let list = template.list(filelists);
        let HTML = template.HTML(
          product,
          list,
          `<div id="article">
            <h2>${product}</h2>
            <p>${description}</p>
          </div>`,
          `<a href='/add'>Add product</a>`
        );
        response.writeHead(200);
        response.end(HTML);
      });
    } else {
      fs.readdir("./data", (err, filelists) => {
        fs.readFile(`data/${queryData.id}`, "utf8", function (
          err,
          description
        ) {
          let product = queryData.id;
          let list = template.list(filelists);
          let HTML = template.HTML(
            product,
            list,
            `<div id="article">
              <h2>${product}</h2>
              <p>${description}</p>
            </div>`,
            `<a href='/add'>Add product</a> 
            <a href='/update?id=${product}'>Update</a> 
            <form action="delete_process" method="post" onsubmit="">
              <input type='hidden' name="id" value='${product}'>
              <input type='submit' value='Delete'>
            </form>`
          );
          response.writeHead(200);
          response.end(HTML);
        });
      });
    }
  } else if (pathname === "/add") {
    fs.readdir("./data", (err, filelists) => {
      let product = "Product-add";
      let list = template.list(filelists);
      let HTML = template.HTML(
        product,
        list,
        `<form action="/add_process" method="post">
          <p><input type="text" name="product" placeholder='product' /></p>
          <p><textarea name="description" placeholder='description'></textarea></p>
          <p><input type="submit" /></p>
        </form>`,
        ``
      );
      response.writeHead(200);
      response.end(HTML);
    });
  } else if (pathname === "/add_process") {
    let body = "";
    request.on("data", (data) => {
      body = body + data;
      // too much POST data, kill the connection!
      //1e6 === 1 * Math.pow(10,6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) request.connection.destroy();
    });
    request.on("end", () => {
      let post = qs.parse(body);
      let product = post.product;
      let description = post.description;
      fs.writeFile(`data/${product}`, description, "utf8", (err) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/?id=${product}` });
        response.end();
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", (err, filelists) => {
      fs.readFile(`data/${queryData.id}`, "utf8", function (err, description) {
        let product = queryData.id;
        let list = template.list(filelists);
        let HTML = template.HTML(
          product,
          list,
          `<form action="/update_process" method="post">
            <input type='hidden' name='id' value='${product}'>
            <p><input type="text" name="product" placeholder='product' value='${product}'/></p>
            <p><textarea name="description" placeholder='description'>${description}</textarea></p>
            <p><input type="submit" /></p>
          </form>`,
          `<a href='/add'>Add product</a> <a href='/update?id=${product}'>Update</a>`
        );
        response.writeHead(200);
        response.end(HTML);
      });
    });
  } else if (pathname === "/update_process") {
    let body = "";
    request.on("data", (data) => {
      body = body + data;
      // too much POST data, kill the connection!
      //1e6 === 1 * Math.pow(10,6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) request.connection.destroy();
    });
    request.on("end", () => {
      let post = qs.parse(body);
      let id = post.id;
      let product = post.product;
      let description = post.description;
      fs.rename(`data/${id}`, `data/${product}`, (err) => {
        if (err) throw err;
        fs.writeFile(`data/${product}`, description, "utf8", (err) => {
          if (err) throw err;
          response.writeHead(302, { Location: `/?id=${product}` });
          response.end();
        });
      });
    });
  } else if (pathname === "/delete_process") {
    let body = "";
    request.on("data", (data) => {
      body = body + data;
      // too much POST data, kill the connection!
      //1e6 === 1 * Math.pow(10,6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) request.connection.destroy();
    });
    request.on("end", () => {
      let post = qs.parse(body);
      let id = post.id;
      fs.unlink(`data/${id}`, (err) => {
        if (err) throw err;
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
