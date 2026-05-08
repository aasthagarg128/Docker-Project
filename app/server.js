const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/profile-picture', (req, res) => {
  const img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// DB Config
// const mongoUrlLocal = "mongodb://admin:password@localhost:27017";
// const mongoUrlDocker = "mongodb://admin:password@mongodb:27017";

// choose based on environment
//const mongoUrl = mongoUrlLocal;
const mongoUrl = "mongodb://localhost:27017";

const client = new MongoClient(mongoUrl);
const databaseName = "my-db";

let db;

// 🔥 Connect once at startup
async function connectDB() {
  try {
    await client.connect();
    db = client.db(databaseName);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ DB Connection Failed", err);
    process.exit(1);
  }
}

// POST: Update profile
app.post('/update-profile', async (req, res) => {
  try {
    let userObj = req.body;
    userObj.userid = 1;

    const result = await db.collection("users").updateOne(
      { userid: 1 },
      { $set: userObj },
      { upsert: true }
    );

    res.send(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
});

// GET: Fetch profile
app.get('/get-profile', async (req, res) => {
  try {
    const user = await db.collection("users").findOne({ userid: 1 });
    res.send(user || {});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching profile");
  }
});

// Start server AFTER DB connects
connectDB().then(() => {
  app.listen(3000, () => {
    console.log("🚀 App listening on port 3000");
  });
});