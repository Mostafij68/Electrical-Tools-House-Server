const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { all } = require('express/lib/application');
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dr98d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('ElectricalTools').collection('products');
        const orderCollection = client.db('ElectricalTools').collection('order');
        const reviewCollection = client.db('ElectricalTools').collection('review');
        const paymentCollection = client.db('ElectricalTools').collection('payments');
        const userCollection = client.db('ElectricalTools').collection('user');

        // User info 
        app.get('/user', async (req, res)=>{
            const query = {};
            const cursor = userCollection.find(query);
            const allUser = await cursor.toArray();
            res.send(allUser)
        });

        app.get('/user', async(req, res)=>{
            const email = req.query.email;
            const query = { email: email };
            const cursor = userCollection.find(query);
            const userInfo = await cursor.toArray();
            res.send(userInfo);
        });

        app.put('/user/:email', async (req, res)=>{
            const email = req.params.email;
            const filter = {email: email};
            const user = req.body;
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    displayName: user.displayName,
                    email: user.email,
                    admin: user.admin,
                    education: user.education,
                    address: user.address,
                    location: user.location,
                    phone: user.phone,
                    linkedIn: user.linkedIn
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.patch('/user/:id', async (req, res) => {
            const id = req.params.id;
            const admin = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    admin: admin.admin
                }
            };
            const update = await userCollection.updateOne(filter, updateDoc, options);
            res.send(update);
        });


        // card payment
        app.post('/create-payment-intent', async (req, res) => {
            const {totalPrice} = req.body;
            const amount = totalPrice * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            
            res.send({ clientSecret: paymentIntent.client_secret });
        });


        // products api
        app.get('/products', async (req, res) => {
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
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        app.get('/order', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const order = await cursor.toArray();
            res.send(order);
        });

        app.get('/order', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const order = await cursor.toArray();
            res.send(order);
        });


        // payment api
        app.patch('/order/:id', async(req, res) =>{
            const id  = req.params.id;
            const payment = req.body;
            const filter = {_id: ObjectId(id)};
            const updatedDoc = {
              $set: {
                paid: true,
                transactionId: payment.transactionId
              }
            }
      
            const result = await paymentCollection.insertOne(payment);
            const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
            res.send(updatedOrder);
          })

        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        });

        app.delete('/order/:id', async (req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.send(result)
        });


        // Review api
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review)
        });

    }
    finally { }
};
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('hello')
});

app.listen(port, () => { })