const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//* middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`Zedblock server is running!`)
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.drjbcpx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const usersCollection = client.db('zedblock').collection('users')

        //* register
        app.post('/register', async (req, res) => {
            const user = req.body;
            const isAlreadyRegister = await usersCollection.findOne(user);
            const isRegister = isAlreadyRegister?.name === user?.name;
            if (isRegister) {
                return res.send({ message: 'The user name already exist' })
            }
            const result = await usersCollection.insertOne(user);
            res.send({ user: user });
        })

        //* login
        app.post('/login', async (req, res) => {
            const user = req.body;
            const isUserExist = await usersCollection.findOne(user);
            if (!isUserExist) {
                return res.send({ message: 'User not found' })
            }
            res.send({ user: user });
        })


    }
    finally {

    }
}
run().catch(err => console.log(err))



app.listen(port, () => {
    console.log(`zedblock server is running on ${port} port`)
})