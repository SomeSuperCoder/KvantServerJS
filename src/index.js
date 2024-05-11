import express from "express";
import PocketBase from "pocketbase";

const pb = new PocketBase('http://127.0.0.1:8090');
pb.admins.authWithPassword("ithelper9@gmail.com", "allen@SqL123");

// Create an instance of the Express application
const app = express();

app.get('/users', async (req, res) => {
    try {
        const record = await pb.collection('users').getFullList({});
        res.json(record);
    } catch (err) {
        console.log(err);
        res.json(null);
    }
});

app.get('/users/:username', async (req, res) => {
    try {
        const record = await pb.collection('users').getFirstListItem(`username="${req.params.username}"`, {});
        res.json(record);
    } catch (err) {
        console.log(err);
        res.json(null);
    }
});

app.post("/users/update/:username", async (req, res) => {
    const username = req.params.username;

    try {
        const data = JSON.parse(req.body);

        const record = await pb.collection('users').getFirstListItem(`username="${username}"`);

        if (record) {
            await pb.collection('users').update(record.id, data);
        }

        res.json(null)
    } catch (err) {
        console.log(err)
        res.json(null)
    }
});

app.get('/history', async (req, res) => {
    try {
        const record = await pb.collection('history').getFullList({});
        res.json(record);
    } catch (err) {
        console.log(err);
        res.json(null);
    }
});


app.get('/history/:username', async (req, res) => {
    try {
        const record = await pb.collection('history').getFirstListItem(`username="${req.params.username}"`, {});
        res.json(record);
    } catch (err) {
        console.log(err);
        res.json(null);
    }
});

app.post("/history/add", async (req, res) => {
    try {
        const data = JSON.parse(req.body);
        try {
            await pb.collection('history').create(data);
        } catch (err) {
            console.log(err)
        }

        res.json(null)
    } catch (err) {
        console.log(err)
        res.json(null)
    }
});


app.get('/check_login_credentials', async (req, res) => {
    const login = req.query.login;
    const password = req.query.password;

    try {
        const record = await pb.collection('users').getFirstListItem(`username="${login}" && password="${password}"`);

        if (record) {
            res.json(true)
        } else {
            res.json(false)
        }
    } catch (err) {
        console.log(err);
        res.json(false);
    }
});

app.get('/does_exist_pair', async (req, res) => {
    const name = req.query.name;
    const birthdate = req.query.birthdate;

    try {
        const record = await pb.collection('users').getFirstListItem(`name="${name}" && birthdate="${birthdate}"`);

        if (record) {
            res.json(true)
        } else {
            res.json(false)
        }
    } catch (err) {
        console.log(err);
        res.json(false);
    }
});

app.get('/passwd', async (req, res) => {
    const login = req.query.login;
    console.log(login)
    const new_password = req.query.new_password;
    console.log(new_password)
    try {
        const record = await pb.collection('users').getFirstListItem(`username="${login}" && password="ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f"`);

        if (record) {
            record.password = new_password;
            await pb.collection('users').update(record.id, record);

            res.json(true)
        }
    } catch (err) {
        console.log(err);
        res.json(null);
    }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
