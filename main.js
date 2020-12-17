let http = require("http");
let fs = require("fs");
let url = require("url");

let app = http.createServer(function (request, response) {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (err, filelists) => {
        let title = "welcome";
        let description = "Hello, Node.js";
        let list = "<ul>";
        var i = 0;
        while (i < filelists.length) {
          list =
            list +
            `<li><a href='/?id=${filelists[i]}'>${filelists[i]}</a></li>`;
          i = i + 1;
        }
        list = list + "</ul>";
        let template = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <title>SOM Accessories ${title}</title>
                <link rel="stylesheet" type="text/css" href="main.css" />
                <script src="main.js"></script>
              </head>
              <body>
                <h1><a href="/">SOM Accessories</a></h1>
                <div id="grid">
                  ${list}
                  <div id="article">
                    <h2>${title}</h2>
                    <p>${description}</p>
                  </div>
                </div>
              </body>
            </html>
              `;
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("./data", (err, filelists) => {
        let list = "<ul>";
        var i = 0;
        while (i < filelists.length) {
          list =
            list +
            `<li><a href='/?id=${filelists[i]}'>${filelists[i]}</a></li>`;
          i = i + 1;
        }
        list = list + "</ul>";
        fs.readFile(`data/${queryData.id}`, "utf8", function (
          err,
          description
        ) {
          let title = queryData.id;
          let template = `
          <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>SOM Accessories ${title}</title>
            <link rel="stylesheet" type="text/css" href="main.css" />
            <script src="main.js"></script>
          </head>
          <body>
            <h1><a href="/">SOM Accessories</a></h1>
            <div id="grid">
              ${list}
              <div id="article">
                <h2>${title}</h2>
                <p>${description}</p>
              </div>
            </div>
          </body>
        </html>
          `;
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
