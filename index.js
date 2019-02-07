const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());

let shoppingList = [
    {
      "id": 0,
      "content": "Seedless grapes"
    },
    {
      "id": 1,
      "content": "Eucalyptus menthol candies"
    },
    {
      "id": 2,
      "content": "Kane's"
    }
  ]

const logger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
}

app.use(logger);

const generateId = () => {
  const maxId = shoppingList.length > 0 ?
    shoppingList.map(n => n.id).sort((a,b) => a - b).reverse()[0] : 1;
  return maxId + 1;
}

app.post("/shoppinglist", (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(404).json({ error: "content missing" });
  }

  const item = {
    content: body.content,
    id: generateId()
  }

  shoppingList = shoppingList.concat(item);

  res.json(item);
})

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
})

app.get("/shoppinglist", (req, res) => {
  res.json(shoppingList);
})

app.get("/shoppinglist/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = shoppingList.find(item => item.id === id);

  if (item) {
    res.json(item);
  } else {
    res.status(404).end();
  }
})

app.delete("/shoppinglist/:id", (req, res) => {
  const id = Number(req.params.id);
  shoppingList = shoppingList.filter(item => item.id !== id);

  res.status(204).end();
})

const error = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'});
}

app.use(error);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
