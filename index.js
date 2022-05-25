const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dr98d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productsCollection = client.db('ElectricalTools').collection('products');
        const orderCollection = client.db('ElectricalTools').collection('order');

        // products api
        app.get('/products', async (req, res)=>{
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        // Order api
        app.post('/order', async (req, res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        app.get('/order', async (req, res)=>{
            const email = req.query.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const order = await cursor.toArray();
            res.send(order);
        });

    }
    finally{}
};
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('hello')
});

app.listen(port, ()=>{})