const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  serverSelectionTimeoutMS: 3000,
  autoSelectFamily: false,
});
async function run() {
  try {
    await client.connect();

    const db = client.db("plantBook");
    const gardenersCollection = db.collection("featuredGardeners");
    const tipsCollection = db.collection("allTips");

    app.get("/gardeners", async (req, res) => {
      const activeGardeners = await gardenersCollection
        .find({ active: true })
        .limit(6)
        .toArray();
      res.send(activeGardeners);
    });

    app.get("/gardeners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gardenersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/plantdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/addnewtip", async (req, res) => {
      const newTip = req.body;
      const result = await tipsCollection.insertOne(newTip);
      res.send(result);
    });

    app.get("/alltips", async (req, res) => {
      const query = { availability: "Public" };
      const result = await tipsCollection.find(query).toArray();
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB! ok"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
