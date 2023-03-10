const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId, ConnectionCheckOutStartedEvent } = require('mongodb');

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
        const tasksCollection = client.db('zedblock').collection('tasks')

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
                return res.send({ message: 'Something went wrong' })
            }
            res.send({ user: user });
        })

        //* get tasks 
        app.get('/get-tasks', async (req, res) => {
            const name = req.query.name;
            const password = req.query.password;
            const query = {
                name,
                password
            };
            const tasks = await tasksCollection.find(query).toArray();
            res.send(tasks)
        })

        //* change checkbox status
        app.put('/status', async (req, res) => {
            const id = req.query.id
            const name = req.body.name
            const password = req.body.password;
            const state = JSON.parse(req.query.state);
            const filter = {
                _id: new ObjectId(id),
                name,
                password
            };
            const updatedDoc = {
                $set: {
                    status: state
                }
            }
            const result = await tasksCollection.updateOne(filter, updatedDoc);
            res.send(result)

        })

        //* get task by id
        app.get('/get-task', async (req, res) => {
            const id = req.query.id;
            const name = req.query.name;
            const password = req.query.password;
            const query = {
                _id: new ObjectId(id),
                name,
                password
            }
            const task = await tasksCollection.findOne(query)
            res.send(task)
        })

        //* delete task
        app.delete('/delete-task', async (req, res) => {
            const id = req.query.id;
            const name = req.query.name;
            const password = req.query.password;
            const query = {
                _id: new ObjectId(id),
                name,
                password
            };
            const result = await tasksCollection.deleteOne(query);
            res.send(result)
        })

        //* add task
        app.post('/add-task', async (req, res) => {
            const task = req.body;
            const result = await tasksCollection.insertOne(task);
            res.send(result);
        })

        //* edit task
        app.patch('/edit-task', async (req, res) => {
            const editedTask = req.body;
            const filter = {
                _id: new ObjectId(editedTask.id),
                name: editedTask.name,
                password: editedTask.password
            };
            const updatedDoc = {
                $set: {
                    title: editedTask.title,
                    description: editedTask.description
                }
            };
            const result = await tasksCollection.updateOne(filter, updatedDoc);
            res.send(result)
        })

        //* remove completed tasks
        app.get('/remove-completed-tasks', async (req, res) => {
            const name = req.query.name;
            const password = req.query.password;
            const query = {
                name,
                password
            };
            const allTasks = await tasksCollection.find(query).toArray();

            const completedTasks = allTasks.filter(task => task.status === true);
            const mapCompletedTasks = completedTasks.map(async (task) => {
                const result = await tasksCollection.deleteOne({ _id: new ObjectId(task._id) });
            })
            const activeTasks = allTasks.filter(task => task.status === false);
            res.send(activeTasks);
        })

        //* sorting
        app.get('/tasks-sorting', async (req, res) => {
            const sortValue = req.query.sortValue;
            const name = req.query.name;
            const password = req.query.password;
            const query = {
                name,
                password
            };
            const allTasks = await tasksCollection.find(query).toArray();
            if (sortValue === 'true') {
                const completedTasks = allTasks.filter(task => task.status === true);
                res.send(completedTasks);

            } else if (sortValue === 'false') {
                const activeTasks = allTasks.filter(task => task.status === false);
                res.send(activeTasks)
            } else if (sortValue === 'all') {
                const allTasks = await tasksCollection.find(query).toArray();
                res.send(allTasks)
            }
        })

        //* search by title
        app.get('/task-search', async (req, res) => {
            const searchText = req.query.searchText;
            const name = req.query.name;
            const password = req.query.password;
            const query = {
                name,
                password
            };
            const tasks = await tasksCollection.find(query).toArray();
            const searchedTask = tasks.filter(task => task.title.includes(searchText));
            res.send(searchedTask);
        })

    }
    finally {

    }
}
run().catch(err => console.log(err))



app.listen(port, () => {
    console.log(`zedblock server is running on ${port} port`)
})