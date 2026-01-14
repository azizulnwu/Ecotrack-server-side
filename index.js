require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const admin = require("firebase-admin");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;

const serviceAccount = require("./firebase-adminsdk-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middlewares
app.use(express.json());
app.use(cors());

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
    const userChallengesCollection = db.collection("userChallenges");
    const tipsCollection = db.collection("tips");
    const upcomingEventCollection = db.collection("upcomingEvent");

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

    app.get("/user", async (req, res) => {
      const{ email} = req.query;
      const query = {
        email: email,
      };
      const result = await userCollection.findOne(query);
      res.send(result)
    });

    app.get("/user/all", async (req, res) => {
     const result = await userCollection.find().toArray()
      res.send(result)
    });

    // Challenges Related API
    app.post("/challenges", async (req, res) => {
      const challenge = req.body;

      challenge.participants = 0;
      challenge.createAt = new Date();
      const query = { category: challenge.category };
      const challengeDuplicateFind = await challengesCollection.findOne(query);

      if (challengeDuplicateFind) {
        return res.send({ message: "Challenge is already Saved" });
      }

      const result = await challengesCollection.insertOne(challenge);
      res.send({ message: "Challenge Saved" });
    });

    app.get("/challengeData", async (req, res) => {
      const result = await challengesCollection.find().toArray();
      res.send(result);
    });

    app.get("/challengeData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await challengesCollection.findOne(query);
      res.send(result);
    });

    app.patch("/challenges/image", async (req, res) => {
      const challenge = req.body;
      const query = { category: challenge.category };
      const updateData = {
        $set: {
          image: challenge.image,
        },
      };
      const result = await challengesCollection.updateOne(query, updateData);
      res.send(result);
    });
    app.patch("/challenges/category", async (req, res) => {
      const { category } = req.query;
      const query = { category };
      const findData = await challengesCollection.findOne(query);

      const updateData = {
        $set: {
          participants: findData.participants + 1,
        },
      };
      const result = await challengesCollection.updateOne(query, updateData);
      res.send(result);
    });

    //  userChallengesCollection Related API

    app.post("/userChallenges", async (req, res) => {
      const userChallengesInfo = req.body;
      userChallengesInfo.joinDate = new Date();

      const query = {
        category: userChallengesInfo.category,
        userEmail: userChallengesInfo.email,
      };
      const userChallengeDuplicateFind = await userChallengesCollection.findOne(
        query
      );

      if (userChallengeDuplicateFind) {
        return res.send({ message: "User already this Challenge taken" });
      }

      const result = await userChallengesCollection.insertOne(
        userChallengesInfo
      );
      res.send(result);
    });

    app.get("/userChallengeDuplicateFind", async (req, res) => {
      const { category, email } = req.query;

      console.log(category, email);
      const result = await userChallengesCollection.findOne({
        category: category,
        userEmail: email,
      });

      res.send(result);
    });

    app.get("/userChallenges/find", async (req, res) => {
      const { email } = req.query;
      const query = {
        userEmail: { $regex: email, $options: "i" },
      };
      const result = await userChallengesCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/userChallenges/statusUpdated", async (req, res) => {
      const statusUpdated = req.body;
      console.log(statusUpdated.challengeId);
      const query = {
        challengeId: statusUpdated.challengeId,
        userEmail: statusUpdated.userEmail,
      };

      const updateStatus = {
        $set: { status: statusUpdated.status },
      };

      const result = await userChallengesCollection.updateOne(
        query,
        updateStatus
      );
      res.send(result);
    });

    app.post("/userChallenges/delete", async (req, res) => {
      const deleteData = req.body;
      console.log(deleteData.challengeId);
      const query = {
        challengeId: deleteData.challengeId,
        userEmail: deleteData.userEmail,
      };
      const result = await userChallengesCollection.deleteOne(query);
      res.send(result);
    });

    // Tips Related Api
    app.post("/tips",async (req,res)=>{
      const tipsData = req.body
      const result =await tipsCollection.insertOne(tipsData )
      res.send(result)
    })

    app.get("/tips/all",async (req,res)=>{
      const result = await tipsCollection.find().toArray()
      res.send(result)
    })
    // Event Related Api
    app.post("/events",async (req,res)=>{
      const tipsData = req.body
      const result =await upcomingEventCollection.insertOne(tipsData )
      res.send(result)
    })

    app.get("/events/all",async (req,res)=>{
      const result = await upcomingEventCollection.find().toArray()
      res.send(result)
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
