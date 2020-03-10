"use strict";
/* eslint-disable no-console */
const express = require("express");
const startWPTServer = require("./start-wpt-server.js");

if (require.main === module) {
  const falsyString = /^(false|0n?|null|undefined|NaN)??$/;
  function parseQuery(query) {
    const result = { toUpstream: false };
    if ("to-upstream" in query) {
      let toUpstream = query["to-upstream"];
      if (typeof toUpstream === "string") {
        toUpstream = toUpstream.trim();
        result.toUpstream = !falsyString.test(toUpstream);
      }
    }
    return result;
  }

  const app = express();

  app.head("/start-wpt-server", (req, res) => {
    const query = parseQuery(req.query);
    console.log(`HEAD for WPT server with query ${JSON.stringify(query)}`);

    res.setHeader("X-JSDOM-WPT-Directory", query.toUpstream ? "to-upstream" : "tests");
    res.status(200).send();
  });

  app.get("/start-wpt-server", (req, res) => {
    const query = parseQuery(req.query);
    console.log(`Starting WPT server with query ${JSON.stringify(query)}`);

    res.setHeader("X-JSDOM-WPT-Directory", query.toUpstream ? "to-upstream" : "tests");
    startWPTServer(query).then(
      url => {
        res.status(200).send(url);
      },
      reason => {
        res.status(500).send(reason);
      }
    );
  });

  app.get("/*", (req, res) => res.sendStatus(404));
  app.listen(8000);

  console.log(`Serving JSDOM Web Platform Tests API on \`http://localhost:8000/\``);
}
