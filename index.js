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
  cors()
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

    const db = client.db("ecoTrack");
    const userCollection = db.collection("users");
    const challengesCollection = db.collection("challenges");
     
  //  User Related API 
    app.post("/users", async (req, res) => {
      const user = req.body;
      user.roll = "user";
      user.createAt = new Date();

      const query = { email: user.email };
      const userDuplicate = await userCollection.findOne(query);

      if (userDuplicate) {
        return res.send({ message: "user already exist" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Challenges Related API
    app.post("/challenges",async (req,res)=>{
      const challenge = req.body
      challenge.participants = 0;
      challenge.createAt = new Date();
      const query = {title : challenge.title}
      const challengeDuplicateFind = await challengesCollection.findOne(query)

      if(challengeDuplicateFind){
        return res.send({message:"Challenge is already Saved"})
      }

      const result = await challengesCollection.insertOne(challenge)
      res.send({message:"Challenge Saved"})
    })






















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
