const express = require('express');
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://etimourakkhieti:AqfswWDKa8bJ0wVh@cluster0.dv2hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("usersDB");
    const usersCollection = database.collection("users");

    app.get('/users', async( req, res) => {
        const cursor = usersCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })

   //update
    app.get('/users/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.send(user);
  })

  app.put('/users/:id', async(req, res) =>{
    const id = req.params.id;
    const user = req.body;
    console.log(id, user);
    
    const filter = {_id: new ObjectId(id)}
    const options = {upsert: true}
    const updatedUser = {
        $set: {
            name: user.name,
            email: user.email
        }
    }

    const result = await usersCollection.updateOne(filter, updatedUser, options );
    res.send(result);

})

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log('New user', user);
      try {
        const result = await usersCollection.insertOne(user);
        res.status(201).send(result);
      } catch (err) {
        console.error("Error inserting user:", err);
        res.status(500).send({ error: "Failed to insert user" });
      }
    });

    app.delete('/users/:id', async(req, res) =>{
      const id = req.params.id;
      console.log('please delete from database', id);
      const query = { _id: new ObjectId(id)}
      
      const result = await usersCollection.deleteOne(query);
      res.send(result);
  })


    console.log("Routes are ready");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Simple CRUD is running');
});

app.listen(port, () => {
  console.log(`Simple CRUD is running on port: ${port}`);
});
