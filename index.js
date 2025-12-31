require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const admin = require("firebase-admin");
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = process.env.PORT || 3000;

const serviceAccount = require("./firebase-adminsdk-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: [process.env.CLIENT_DOMAIN],
    credentials: true,
  })
);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster1.19ohfxv.mongodb.net/?appName=Cluster1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // await client.connect();



    

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Server..");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
