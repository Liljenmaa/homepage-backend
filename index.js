const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool } = require("./db");

app.use(cors());
app.use(bodyParser.json());

const logger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
}

app.use(logger);

app.get("/api/test", (req, res) => {
  res.send("<h1>Hello World!</h1>");
})

app.post("/api/shoppinglist", async (req, res) => {
  try {
    const body = req.body;

    if (!body.entry) {
      return res.status(400).json({ error: "entry missing" });
    }

    if (body.entry.length > 75) {
      return res.status(400).json({ error: "entry longer than 75 chars"});
    }

    const sanitizedEntry = body.entry.replace(/'/g, "''");

    const query = "INSERT INTO shoppinglist(entry) VALUES ('" + sanitizedEntry + "') RETURNING *;";
    const dbres = await pool.query(query);

    return res.json(dbres.rows);
  } catch (error) {
    return res.status(500).end();
  }
})

app.get("/api/shoppinglist", async (req, res) => {
  try {
    const query = "SELECT * FROM shoppinglist;";
    const dbres = await pool.query(query);

    return res.json(dbres.rows);
  } catch (error) {
    res.status(500).end();
  }
})

app.get("/api/shoppinglist/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (id === undefined) {
      return res.status(400).json({ error: "id not defined" });
    }

    if (typeof Number(id) !== "number") {
      return res.status(400).json({ error: "id not a number" });
    }

    const query = "SELECT * FROM shoppinglist WHERE id = " + id + ";";
    const dbres = await pool.query(query);

    return res.json(dbres.rows);
  } catch (error) {
    res.status(500).end();
  }
})

app.delete("/api/shoppinglist/:id", async (req, res) => {
  try {
  const id = req.params.id;

  if (id === undefined) {
    return res.status(400).json({ error: "id not defined" });
  }

  if (typeof Number(id) !== "number") {
    return res.status(400).json({ error: "id not a number" });
  }

  const query = "DELETE FROM shoppinglist WHERE id = " + id + ";";
  const dbres = await pool.query(query);

  res.status(204).end();
  } catch (error) {
    res.status(500).end();
  }
})

app.get("/api/highscores", async (req, res) => {
  try {
    const dbres = await pool.query("SELECT nick, score FROM yahtzeescores ORDER BY score DESC");

    res.json(dbres.rows);
  } catch (error) {
    res.status(500).end();
  }
})

app.post("/api/highscores", async (req, res) => {
  try {
    if (req.body.nick === undefined || req.body.score === undefined) {
      return res.status(400).json({ error: "nick or score missing" });
    }

    if (req.body.nick.length !== 3) {
      return res.status(400).json({ error: "nick not 3 chars long" });
    }

    const query = "INSERT INTO yahtzeescores (nick, score) VALUES ('" + req.body.nick + "', " + req.body.score + ");";
    await pool.query(query);

    return res.status(201).end();
  } catch (error) {
    res.status(500).end();
  }
})

const error = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'});
}

app.use(error);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
