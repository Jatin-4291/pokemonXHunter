require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const SMTPTransport = require('nodemailer/lib/smtp-transport');
const request = require('request');
const hint = require('./hint');

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
        res.render('register', {message: "Passwords don't match"});
    }
    else if(password.length < 8) {
        res.render('register', {message: "Password should be atleast 8 characters long"});
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
        res.render('confirm');
    }
});

app.get('/confirm', (req, res) => {
    res.render('confirm');
});

app.get('/bellsprout', (req, res) => {
    const route = req.route.path
    const image = `/images/bellsprout.png`;
    res.render('game', {route: route, hint: hint.bellsprout, image: image });
});

app.get('/bulbasaur', (req, res) => {
    const route = req.route.path
    const image = `/images/bulbasaur.png`;
    res.render('game', {route: route, hint: hint.bulbasaur, image: image });
});

app.get('/butterfree', (req, res) => {
    const route = req.route.path
    const image = `/images/butterfree.png`;
    res.render('game', {route: route, hint: hint.butterfree, image: image });
});

app.get('/caterpie', (req, res) => {
    const route = req.route.path
    const image = `/images/caterpie.png`;
    res.render('game', {route: route, hint: hint.caterpie, image: image });
});

app.get('/chansey', (req, res) => {
    const route = req.route.path
    const image = `/images/chansey.png`;
    res.render('game', {route: route, hint: hint.chansey, image: image });
});

app.get('/charizard', (req, res) => {
    const route = req.route.path
    const image = `/images/charizard.png`;
    res.render('game', {route: route, hint: hint.charizard, image: image });
});

app.get('/charmander', (req, res) => {
    const route = req.route.path
    const image = `/images/charmander.png`;
    res.render('game', {route: route, hint: hint.charmander, image: image });
});

app.get('/clefairy', (req, res) => {
    const route = req.route.path
    const image = `/images/clefairy.png`;
    res.render('game', {route: route, hint: hint.clefairy, image: image });
});

app.get('/diglett', (req, res) => {
    const route = req.route.path
    const image = `/images/diglett.png`;
    res.render('game', {route: route, hint: hint.diglett, image: image });
});

app.get('/ditto', (req, res) => {
    const route = req.route.path
    const image = `/images/ditto.png`;
    res.render('game', {route: route, hint: hint.ditto, image: image });
});

app.get('/dragonite', (req, res) => {
    const route = req.route.path
    const image = `/images/dragonite.png`;
    res.render('game', {route: route, hint: hint.dragonite, image: image });
});

app.get('/eevee', (req, res) => {
    const route = req.route.path
    const image = `/images/eevee.png`;
    res.render('game', {route: route, hint: hint.eevee, image: image });
});

app.get('/ekans', (req, res) => {
    const route = req.route.path
    const image = `/images/ekans.png`;
    res.render('game', {route: route, hint: hint.ekans, image: image });
});

app.get('/gengar', (req, res) => {
    const route = req.route.path
    const image = `/images/gengar.png`;
    res.render('game', {route: route, hint: hint.gengar, image: image });
});

app.get('/geodude', (req, res) => {
    const route = req.route.path
    const image = `/images/geodude.png`;
    res.render('game', {route: route, hint: hint.geodude, image: image });
});

app.get('/gyarados', (req, res) => {
    const route = req.route.path
    const image = `/images/gyarados.png`;
    res.render('game', {route: route, hint: hint.gyarados, image: image });
});

app.get('/jigglypuff', (req, res) => {
    const route = req.route.path
    const image = `/images/jigglypuff.png`;
    res.render('game', {route: route, hint: hint.jigglypuff, image: image });
});

app.get('/jynx', (req, res) => {
    const route = req.route.path
    const image = `/images/jynx.png`;
    res.render('game', {route: route, hint: hint.jynx, image: image });
});

app.get('/koffing', (req, res) => {
    const route = req.route.path
    const image = `/images/koffing.png`;
    res.render('game', {route: route, hint: hint.koffing, image: image });
});

app.get('/lapras', (req, res) => {
    const route = req.route.path
    const image = `/images/lapras.png`;
    res.render('game', {route: route, hint: hint.lapras, image: image });
});

app.get('/machamp', (req, res) => {
    const route = req.route.path
    const image = `/images/machamp.png`;
    res.render('game', {route: route, hint: hint.machamp, image: image });
});

app.get('/magikarp', (req, res) => {
    const route = req.route.path
    const image = `/images/magikarp.png`;
    res.render('game', {route: route, hint: hint.magikarp, image: image });
});

app.get('/meowth', (req, res) => {
    const route = req.route.path
    const image = `/images/meowth.png`;
    res.render('game', {route: route, hint: hint.meowth, image: image });
});

app.get('/mew', (req, res) => {
    const route = req.route.path
    const image = `/images/mew.png`;
    res.render('game', {route: route, hint: hint.mew, image: image });
});

app.get('/mewtwo', (req, res) => {
    const route = req.route.path
    const image = `/images/mewtwo.png`;
    res.render('game', {route: route, hint: hint.mewtwo, image: image });
});

app.get('/mr-mine', (req, res) => {
    const route = req.route.path
    const image = `/images/mr-mine.png`;
    res.render('game', {route: route, hint: hint.mrmine, image: image });
});

app.get('/muk', (req, res) => {
    const route = req.route.path
    const image = `/images/muk.png`;
    res.render('game', {route: route, hint: hint.muk, image: image });
});

app.get('/ninetales', (req, res) => {
    const route = req.route.path
    const image = `/images/ninetales.png`;
    res.render('game', {route: route, hint: hint.ninetales, image: image });
});

app.get('/oddish', (req, res) => {
    const route = req.route.path
    const image = `/images/oddish.png`;
    res.render('game', {route: route, hint: hint.oddish, image: image });
});

app.get('/onix', (req, res) => {
    const route = req.route.path
    const image = `/images/onix.png`;
    res.render('game', {route: route, hint: hint.onix, image: image });
});

app.get('/persian', (req, res) => {
    const route = req.route.path
    const image = `/images/persian.png`;
    res.render('game', {route: route, hint: hint.persian, image: image });
});

app.get('/pikachu', (req, res) => {
    const route = req.route.path
    const image = `/images/pikachu.png`;
    res.render('game', {route: route, hint: hint.pikachu, image: image });
});

app.get('/psyduck', (req, res) => {
    const route = req.route.path
    const image = `/images/psyduck.png`;
    res.render('game', {route: route, hint: hint.psyduck, image: image });
});

app.get('/rattata', (req, res) => {
    const image = `/images/rattata.png`;
    res.render('game', {route: route, hint: hint.rattata, image: image });
});

app.get('rhyhorn', (req, res) => {
    const image = `/images/rhyhorn.png`;
    res.render('game', {route: route, hint: hint.rhyhorn, image: image });
});

app.get('/scyther', (req, res) => {
    const route = req.route.path
    const image = `/images/scyther.png`;
    res.render('game', {route: route, hint: hint.scyther, image: image });
});

app.get('/seadra', (req, res) => {
    const route = req.route.path
    const image = `/images/seadra.png`;
    res.render('game', {route: route, hint: hint.seadra, image: image });
});

app.get('/slowpoke', (req, res) => {
    const route = req.route.path
    const image = `/images/slowpoke.png`;
    res.render('game', {route: route, hint: hint.slowpoke, image: image });
});

app.get('/snorlax', (req, res) => {
    const route = req.route.path
    const image = `/images/snorlax.png`;
    res.render('game', {route: route, hint: hint.snorlax, image: image });
});

app.get('/squirtle', (req, res) => {
    const route = req.route.path
    const image = `/images/squirtle.png`;
    res.render('game', {route: route, hint: hint.squirtle, image: image });
});

app.get('/staryu', (req, res) => {
    const route = req.route.path
    const image = `/images/staryu.png`;
    res.render('game', {route: route, hint: hint.staryu, image: image });
});

app.get('/tauros', (req, res) => {
    const route = req.route.path
    const image = `/images/tauros.png`;
    res.render('game', {route: route, hint: hint.tauros, image: image });
});

app.get('/voltorb', (req, res) => {
    const route = req.route.path
    const image = `/images/voltorb.png`;
    res.render('game', {route: route, hint: hint.voltorb, image: image });
});

app.get('/vulpix', (req, res) => {
    const route = req.route.path
    const image = `/images/vulpix.png`;
    res.render('game', {route: route, hint: hint.vulpix, image: image });
});

app.get('/zapdos', (req, res) => {
    const route = req.route.path
    const image = `/images/zapdos.png`;
    res.render('game', {route: route, hint: hint.zapdos, image: image });
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});