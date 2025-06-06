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
    .sort({ totalLiked: -1 }) 
    .limit(6)
    .toArray();

  res.send(result);
});


// app.put("/alltips/:id/like", async (req, res) => {
//   const id = req.params.id;
//   const { userEmail } = req.body;

//   const tip = await tipsCollection.findOne({ _id: new ObjectId(id) });

//   if (!tip) return res.status(404).send({ error: "Tip not found" });

//   const hasLiked = tip.likedBy?.includes(userEmail);

//   const updateDoc = hasLiked
//     ? {
//         $inc: { totalLiked: -1 },
//         $pull: { likedBy: userEmail },
//       }
//     : {
//         $inc: { totalLiked: 1 },
//         $addToSet: { likedBy: userEmail },
//       };

//   const result = await tipsCollection.updateOne(
//     { _id: new ObjectId(id) },
//     updateDoc
//   );

//   res.send(result);
// });

app.put("/alltips/:id/like", async (req, res) => {
  const id = req.params.id;
  const { userEmail } = req.body;

  const result = await tipsCollection.updateOne(
    { _id: new ObjectId(id), likedBy: { $ne: userEmail } },
    {
      $addToSet: { likedBy: userEmail },
      $inc: { totalLiked: 1 },
    }
  );

  res.send(result);
});



app.put("/alltips/:id/like", async (req, res) => {
  const id = req.params.id;
  const { userEmail } = req.body;

  const result = await tipsCollection.updateOne(
    { _id: new ObjectId(id), likedBy: { $ne: userEmail } },
    {
      $addToSet: { likedBy: userEmail },
      $inc: { totalLiked: 1 },
    }
  );

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

    app.get("/alltips/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const result = await tipsCollection.findOne(filter);
      res.send(result);
    });

    // tips with myEmail
    app.get("/mytips/:email", async (req, res) => {
      const myEmail = req.params.email;
      const query = { userEmail: myEmail };
      const result = await tipsCollection.find(query).toArray();
      res.send(result);
    });


app.put("/alltips/:id/like", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $inc: { totalLiked: 1 }
  };
  const result = await tipsCollection.updateOne(filter, updateDoc);
  res.send(result);
});


    app.get("/initialize-totalLiked", async (req, res) => {
  const result = await tipsCollection.updateMany({}, {
    $set: { totalLiked: 0 }
  });
  res.send(result);
});

    // delete a tip from db

    app.delete("/alltips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/alltips/:id", async (req, res) => {
      const id = req.params.id; // Extract ID from route
      const updatedTip = req.body; // Get updated data from request body
      const filter = { _id: new ObjectId(id) }; // Convert string ID to MongoDB ObjectId
      const updateDoc = {
        $set: updatedTip, // Define the fields to update
      };
      const result = await tipsCollection.updateOne(filter, updateDoc);
      res.send(result); // Send the result back to client
    });

    // add user to database
    app.post("/adduser", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
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
