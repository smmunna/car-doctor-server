const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const data = require('./data.json')
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json())

// console.log(process.env.ACCESS_TOKEN_SECRET)

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

const verifyJWT = (req,res,next)=>{
    const authorization = req.headers.authorization
    // console.log(authorization)
    if(!authorization){
        return res.send({error:'Error occured', message:"You can not access this."})
    }
    const token = authorization.split(' ')[1]
    // console.log(token)
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(error,decode)=>{
        if(error){
            return res.send({error:'Error occured', message:"You can not access this."})
        }
        req.decode = decode
        next()
    })
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("cardoctorDB");
        const servicesCollection = database.collection("services");
        const bookingsCollection = database.collection("bookings");

        // Write down all of your routes;

        // Jwt procedure;
        app.post('/jwt',async(req,res)=>{
            const user = req.body;
            // console.log(user)

           const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:'1h'
           })
           res.send({token})
        })

        // getting individual id;
        app.get('/bookingcarts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: id }
            const result = await servicesCollection.findOne(query)
            res.send(result)
        })

        app.post('/bookingcarts', async (req, res) => {
            const bookingsItem = req.body;
            const result = await bookingsCollection.insertOne(bookingsItem)
            res.send(result);
        })

        app.get('/bookingscartsdata',verifyJWT, async (req, res) => {
            // console.log(req.headers.authorization)
            const decode = req.decode
            // console.log('Comeback after decode',decode.email.email)

            if(decode.email.email !== req.query.email){
                res.status(403).send("Unauthorized access")
            }

            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/bookingscartsdata/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query)
            res.send(result)
        })
        // getting the all services;
        app.get('/services', async (req, res) => {

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