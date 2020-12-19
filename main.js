let http = require("http");
let fs = require("fs");
let url = require("url");

function templateHTML(title, list, body) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>SOM Accessories ${title}</title>
      <link rel="stylesheet" type="text/css" href="main.css">
    </head>
    <body>
      <h1><a href="/">SOM Accessories</a></h1>
      <div id="grid">
        ${list}
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
        let title = "welcome";
        let description = "SOM Accessory is...";
        let list = templateList(filelists);
        let template = templateHTML(
          title,
          list,
          `<div id="article">
        <h2>${title}</h2>
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
          let title = queryData.id;
          let list = templateList(filelists);
          let template = templateHTML(
            title,
            list,
            `<div id="article">
          <h2>${title}</h2>
          <p>${description}</p>
        </div>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
