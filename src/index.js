import express from "express";
import PocketBase from "pocketbase";
import nodemailer from "nodemailer";
import fileUpload from 'express-fileupload';

const pb = new PocketBase('http://127.0.0.1:8090');
pb.admins.authWithPassword("ithelper9@gmail.com", "allen@SqL123");

async function get_user(username) {
    if (!username) {
        return false;
    }

    try {
        const record = await pb.collection('users').getFirstListItem(`username="${username}"`);
        return record
    } catch (err) {
        console.log(`Error fetching user ${username}: ${err}`)
        return null
    }
}

async function admin_auth_check(username, password_hash) {
    if (!username || !password_hash) {
        return false;
    }
    if (username.length != 6) {
        return false;
    }

    const user = await pb.collection("users").getFirstListItem(`username="${username} && password=${password_hash}"`);

    if (!user) {
        return false;
    }

    return true;
}

// Create an instance of the Express application
const app = express();
// Setup file upload functions
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp'
}));

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
        res.json(get_user(req.params.username));
    } catch (err) {
        console.log(err);
        res.json(null);
    }
});

app.get('/users/id/:id', async (req, res) => {
    try {
        const record = await pb.collection('users').getFirstListItem(`id="${req.params.id}"`, {});
        res.json(record);
    } catch (err) {
        console.log(err);
        res.json(null);
    }
});

app.post("/users/update/:username", async (req, res) => {
    const username = req.params.username;

    const admin_username = req.query.username;
    const admin_password_hash = req.query.password_hash;

    if (!admin_auth_check(admin_username, admin_password_hash)) {
        res.json(null);
        return;
    }

    try {
        const data = JSON.parse(req.body);

        const record = await get_user(username);

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
        const record = await get_user(req.params.username);
        res.json(record);
    } catch (err) {
        console.log(err);
        res.json(null);
    }
});

app.post("/history/add", async (req, res) => {
    const admin_username = req.query.username;
    const admin_password_hash = req.query.password_hash;

    if (!admin_auth_check(admin_username, admin_password_hash)) {
        res.json(null);
        return;
    }

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

app.post('/send_mail', async (req, res) => {
    const admin_username = req.query.username;
    const admin_password_hash = req.query.password_hash;

    if (!admin_auth_check(admin_username, admin_password_hash)) {
        res.json(null);
        return;
    }

    console.log("We've got here!")
    const to = req.query.to;
    const subject = req.query.subject;
    let data_file;
    try {
        data_file = req.files.data_file;
    } catch (err) {
        console.log(err);
        res.json(null);
    }

    console.log(data_file)

    const transporter = nodemailer.createTransport({
        service: 'yandex',
        auth: {
          user: 'nchk-kvantomat@yandex.ru',
          pass: 'ikwzkllrqrvdhjwz'
        }
    });

    // Create an email message
    const mailOptions = {
        from: 'nchk-kvantomat@yandex.ru',
        to: to,
        subject: subject,
        text: "",
        attachments: [
            {
              filename: 'kavtomat_report.xlsx',
              path: data_file.tempFilePath
            }
        ]
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          res.json(false);
        } else {
          console.log('Email sent: ' + info.response);
          res.json(true);
        }
    });

    res.json(true);
})

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
