require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const SMTPTransport = require('nodemailer/lib/smtp-transport');
const request = require('request');

const app = express();
const PORT = 5000;


// Set public folder as static folder for static files
app.use(express.static(__dirname + '/public'));

// parse application/json
app.use(bodyParser.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// Set EJS as templating engine
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register', { message: "" });
});

app.post('/register', async (req, res) => {
    let teamName = req.body.teamName;
    let email = req.body.email;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;

    if (password !== confirmPassword) {
        // res.render('register', {message: "Passwords don't match"});
        res.send("Passwords don't match");
    }
    else {
        let team = {
            teamName: teamName,
            email: email,
            password: password
        };
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: `${process.env.EMAIL}`,
              pass: `${process.env.PASSWORD}`
            }
          });

        let mail = {
            from: `${process.env.EMAIL}`,
            to: `${email}`,
            subject: 'Team Registered Successfully',
            html: `
                <h1>Team Registered Successfully</h1>
                <p>Team Name: ${teamName}</p>
                <p>Email: ${email}</p>
            `,
        }

        await transporter.sendMail(mail, (err, data) => {
            if (err) {
                console.log(err)
            } else {
                console.log(data)
            }
        })

        console.log(team);
        // res.render('register', {message: "Team registered successfully"});
        res.send("Team registered successfully");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});