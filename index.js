const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const data = require('./data.json')

// middleware
app.use(cors())
app.use(express.json())


// For Running Locally
const uri = "mongodb://127.0.0.1:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("cardoctorDB");
        const servicesCollection = database.collection("services");
        const bookingsCollection = database.collection("bookings");

        // Write down all of your routes;

         // getting individual id;
        app.get('/bookingcarts/:id', async(req,res)=>{
            const id = req.params.id
            const query ={_id:id}
            const result = await servicesCollection.findOne(query)
            res.send(result)
        })

        app.post('/bookingcarts',async(req,res)=>{
            const bookingsItem = req.body;
            const result = await bookingsCollection.insertOne(bookingsItem)
            res.send(result);
        })
       
        // getting the all services;
        app.get('/services',async(req,res)=>{
            const result = await servicesCollection.find().toArray()
            res.send(result)
        })

       



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error (Removed this portion for solving the error)
    }
}
run().catch(console.dir);


app.get('/', (req, res) => res.send('Server is running successfully'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))