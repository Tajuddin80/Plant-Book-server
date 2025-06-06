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

    // all collections
    const gardenersCollection = db.collection("featuredGardeners");
    const tipsCollection = db.collection("allTips");
    const usersCollection = db.collection("allUsers");

    // get full gardeners list
    app.get("/gardeners", async (req, res) => {
      const activeGardeners = await gardenersCollection
        .find({ active: true })
        .limit(6)
        .toArray();
      res.send(activeGardeners);
    });

    // get recent tips
    app.get("/recenttips", async (req, res) => {
      const result = await tipsCollection
        .find({ availability: "Public" })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // get specific gardeners profile by id
    app.get("/gardeners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gardenersCollection.find(query).toArray();
      res.send(result);
    });

    // get specific plant details by id
    app.get("/plantdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipsCollection.find(query).toArray();
      res.send(result);
    });

    // add new tips
    app.post("/addnewtip", async (req, res) => {
      const newTip = req.body;
      const result = await tipsCollection.insertOne(newTip);
      res.send(result);
    });

    // get all tips
    app.get("/alltips", async (req, res) => {
      const query = { availability: "Public" };
      const result = await tipsCollection.find(query).toArray();
      res.send(result);
    });


//  app.get("/mytips", async (req, res) => {
//   const myEmail = req.params.email;
//   const query = { email: myEmail };
//   const result = await tipsCollection.find(query).toArray();
//   res.send(result);
// });


    // add user to database

app.post('/adduser', async(req, res)=>{
  const newUser = req.body;
  const result = await usersCollection.insertOne(newUser);
  res.send(result)
})



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
