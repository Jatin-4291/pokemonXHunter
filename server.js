require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const SMTPTransport = require('nodemailer/lib/smtp-transport');
const request = require('request');
const riddle = require('./riddle');
const code = require('./code');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const pokemon = require('./pokemon');

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

// Set cors
app.use(cors());

// app.use(passport.initialize());
// app.use(passport.session());

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.bwi1a0u.mongodb.net/?retryWrites=true&w=majority`)

const teamSchema = new mongoose.Schema({
    teamName: String,
    leaderName: String,
    email: String,
    password: String,
    member2: String,
    member3: String,
    member4: String,
    member5: String,
    points: Number,
    hintsLeft: Number,
    bellsprout: Boolean,
    bulbasaur: Boolean,
    butterfree: Boolean,
    caterpie: Boolean,
    chansey: Boolean,
    charizard: Boolean,
    charmander: Boolean,
    clefairy: Boolean,
    diglett: Boolean,
    ditto: Boolean,
    dragonite: Boolean,
    eevee: Boolean,
    ekans: Boolean,
    gengar: Boolean,
    geodude: Boolean,
    gyarados: Boolean,
    jigglypuff: Boolean,
    jynx: Boolean,
    koffing: Boolean,
    lapras: Boolean,
    machamp: Boolean,
    magikarp: Boolean,
    meowth: Boolean,
    mew: Boolean,
    mewtwo: Boolean,
    mr_mine: Boolean,
    muk: Boolean,
    ninetales: Boolean,
    oddish: Boolean,
    onix: Boolean,
    persian: Boolean,
    pikachu: Boolean,
    psyduck: Boolean,
    rattata: Boolean,
    rhyhorn: Boolean,
    scyther: Boolean,
    seadra: Boolean,
    slowpoke: Boolean,
    snorlex: Boolean,
    squirtle: Boolean,
    staryu: Boolean,
    tauros: Boolean,
    voltorb: Boolean,
    vulpix: Boolean,
    zapdos: Boolean,
    next: String
});

const team = mongoose.model('team', teamSchema);

// const adminSchema = new mongoose.Schema({
//     username: String,
//     password: String
// });

// const admin = mongoose.model('admin', adminSchema);

// passport.use(admin.createStrategy());
// passport.serializeUser(admin.serializeUser());
// passport.deserializeUser(admin.deserializeUser());

// app.get('/admin/login', (req, res) => {
//     res.render('adminLogin');
// });

// app.get('/admin', (req, res) => {
//     if(req.isAuthenticated()){
//         res.render('admin');
//     }
//     else{
//         res.redirect('/admin/login');
//     }
// });




app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register', { message: "" });
});

app.post('/register', async (req, res) => {
    const teamName = req.body.teamName;
    const leaderName = req.body.leaderName;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const member2 = req.body.member2;
    const member3 = req.body.member3;
    const member4 = req.body.member4;
    const member5 = req.body.member5;

    if (teamName === "" || leaderName === "" || email === "" || password === "" || confirmPassword === "" || member2 === "") {
        res.render('register', { message: "Please fill all the required fields" });
    }
    else if (!email.includes('@') || !email.includes('.')) {
        res.render('register', { message: "Please enter a valid email" });
    }
    else if (password !== confirmPassword) {
        res.render('register', { message: "Passwords don't match" });
    }
    else if (password.length < 8) {
        res.render('register', { message: "Password should be atleast 8 characters long" });
    }
    else {
        team.findOne({ email: email }).then((err, data) => {
            if (data) {
                res.render('register', { message: "Email already registered" });
            }
        });

        const newTeam = new team({
            teamName: teamName,
            leaderName: leaderName,
            email: email,
            password: password,
            member2: member2,
            member3: member3,
            member4: member4,
            member5: member5,
            points: 0,
            hintsLeft: 1,
            bellsprout: false,
            bulbasaur: false,
            butterfree: false,
            caterpie: false,
            chansey: false,
            charizard: false,
            charmander: false,
            clefairy: false,
            diglett: false,
            ditto: false,
            dragonite: false,
            eevee: false,
            ekans: false,
            gengar: false,
            geodude: false,
            gyarados: false,
            jigglypuff: false,
            jynx: false,
            koffing: false,
            lapras: false,
            machamp: false,
            magikarp: false,
            meowth: false,
            mew: false,
            mewtwo: false,
            mr_mine: false,
            muk: false,
            ninetales: false,
            oddish: false,
            onix: false,
            persian: false,
            pikachu: false,
            psyduck: false,
            rattata: false,
            rhyhorn: false,
            scyther: false,
            seadra: false,
            slowpoke: false,
            snorlex: false,
            squirtle: false,
            staryu: false,
            tauros: false,
            voltorb: false,
            vulpix: false,
            zapdos: false,
            next: pokemon[Math.floor(Math.random() * pokemon.length)]
        });


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
                    <div>
                        <h1>Team Registered Successfully</h1>
                        <p>Team Name: ${teamName}</p>
                        <p>Leader Name: <b>${leaderName}</b></p>
                        <p>Team Members: <b>${member2}</b> <br> <b>${member3}</b> <br> <b>${member4}</b> <br> <b>${member5}</b></p>
                        <p>Join our WhatsApp group to stay updated: https://chat.whatsapp.com/Gxi1DJZtonp0CqPFebZ0Y4</p>
                    </div>
                    <div>
                        <h2>Contacts</h2>
                        <p>IEEE YMCA SB JSEC - Daniyal Jawed - 6287912722</p>
                        <p>IEEE SIGHT SB Chairperson - Nishant - 9896774495</p>
                        <p>IEEE WIE SB Chairperson - Asif - 9560491809</p>
                    </div>
                `,
            attachments: [
                {
                    filename: 'GUIDELINES.docx',
                    path: './public/GUIDELINES.docx',
                    contentType: 'application/docx'
                },
                {
                    filename: 'HunterXPokemon.png',
                    path: './public/HunterXPokemon.png',
                    contentType: 'application/png'
                }
            ]
        }

        await transporter.sendMail(mail, (err, data) => {
            if (err) {
                console.log(err)
            } else {
                console.log(data)
            }
        })

        newTeam.save().then(() => {
            res.render('confirm');
        }).catch(() => {
            res.redirect('/register');
        })
    }
});



// app.get(`/${code.bellsprout}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/bellsprout.png`;
//     res.render('game', { route: route, riddle: riddle.bellsprout, image: image });
// });

// app.get('/deepak', (req, res) => {
//     const route = req.route.path
//     const image = `/images/bulbasaur.png`;
//     res.render('game', { route: route, riddle: riddle.bulbasaur, image: image });
// });

// app.get(`/${code.butterfree}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/butterfree.png`;
//     res.render('game', { route: route, riddle: riddle.butterfree, image: image });
// });

// app.get(`/${code.caterpie}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/caterpie.png`;
//     res.render('game', { route: route, riddle: riddle.caterpie, image: image });
// });

// app.get(`/${code.chansey}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/chansey.png`;
//     res.render('game', { route: route, riddle: riddle.chansey, image: image });
// });

// app.get(`/${code.charizard}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/charizard.png`;
//     res.render('game', { route: route, riddle: riddle.charizard, image: image });
// });

// app.get(`/${code.charmander}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/charmander.png`;
//     res.render('game', { route: route, riddle: riddle.charmander, image: image });
// });

// app.get(`/${code.clefairy}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/clefairy.png`;
//     res.render('game', { route: route, riddle: riddle.clefairy, image: image });
// });

// app.get(`/${code.diglett}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/diglett.png`;
//     res.render('game', { route: route, riddle: riddle.diglett, image: image });
// });

// app.get(`/${code.ditto}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/ditto.png`;
//     res.render('game', { route: route, riddle: riddle.ditto, image: image });
// });

// app.get(`/${code.dragonite}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/dragonite.png`;
//     res.render('game', { route: route, riddle: riddle.dragonite, image: image });
// });

// app.get(`/${code.eevee}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/eevee.png`;
//     res.render('game', { route: route, riddle: riddle.eevee, image: image });
// });

// app.get(`/${code.ekans}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/ekans.png`;
//     res.render('game', { route: route, riddle: riddle.ekans, image: image });
// });

// app.get(`/${code.gengar}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/gengar.png`;
//     res.render('game', { route: route, riddle: riddle.gengar, image: image });
// });

// app.get(`/${code.geodude}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/geodude.png`;
//     res.render('game', { route: route, riddle: riddle.geodude, image: image });
// });

// app.get(`/${code.gyarados}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/gyarados.png`;
//     res.render('game', { route: route, riddle: riddle.gyarados, image: image });
// });

// app.get(`/${code.jigglypuff}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/jigglypuff.png`;
//     res.render('game', { route: route, riddle: riddle.jigglypuff, image: image });
// });

// app.get(`/${code.jynx}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/jynx.png`;
//     res.render('game', { route: route, riddle: riddle.jynx, image: image });
// });

// app.get(`/${code.koffing}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/koffing.png`;
//     res.render('game', { route: route, riddle: riddle.koffing, image: image });
// });

// app.get(`/${code.lapras}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/lapras.png`;
//     res.render('game', { route: route, riddle: riddle.lapras, image: image });
// });

// app.get(`/${code.machamp}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/machamp.png`;
//     res.render('game', { route: route, riddle: riddle.machamp, image: image });
// });

// app.get(`/${code.magikarp}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/magikarp.png`;
//     res.render('game', { route: route, riddle: riddle.magikarp, image: image });
// });

// app.get(`/${code.meowth}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/meowth.png`;
//     res.render('game', { route: route, riddle: riddle.meowth, image: image });
// });

// app.get(`/${code.mew}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/mew.png`;
//     res.render('game', { route: route, riddle: riddle.mew, image: image });
// });

// app.get(`/${code.mewtwo}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/mewtwo.png`;
//     res.render('game', { route: route, riddle: riddle.mewtwo, image: image });
// });

// app.get(`/${code.mr_mime}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/mr-mime.png`;
//     res.render('game', { route: route, riddle: riddle.mrmine, image: image });
// });

// app.get(`/${code.muk}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/muk.png`;
//     res.render('game', { route: route, riddle: riddle.muk, image: image });
// });

// app.get(`/${code.ninetales}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/ninetales.png`;
//     res.render('game', { route: route, riddle: riddle.ninetales, image: image });
// });

// app.get(`/${code.oddish}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/oddish.png`;
//     res.render('game', { route: route, riddle: riddle.oddish, image: image });
// });

// app.get(`/${code.onix}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/onix.png`;
//     res.render('game', { route: route, riddle: riddle.onix, image: image });
// });

// app.get(`/${code.persian}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/persian.png`;
//     res.render('game', { route: route, riddle: riddle.persian, image: image });
// });

// app.get(`/${code.pikachu}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/pikachu.png`;
//     res.render('game', { route: route, riddle: riddle.pikachu, image: image });
// });

// app.get('/hemang', (req, res) => {
//     const route = req.route.path
//     const image = `/images/psyduck.png`;
//     res.render('game', { route: route, riddle: riddle.psyduck, image: image });
// });

// app.get('/devansh', (req, res) => {
//     const route = req.route.path;
//     const image = `/images/rattata.png`;
//     res.render('game', { route: route, riddle: riddle.rattata, image: image });
// });

// app.get('/akshit', (req, res) => {
//     const route = req.route.path;
//     const image = `/images/rhyhorn.png`;
//     res.render('game', { route: route, riddle: riddle.rhyhorn, image: image });
// });

// app.get('/mahak', (req, res) => {
//     const route = req.route.path
//     const image = `/images/scyther.png`;
//     res.render('game', { route: route, riddle: riddle.scyther, image: image });
// });

// app.get('/mohan', (req, res) => {
//     const route = req.route.path
//     const image = `/images/seadra.png`;
//     res.render('game', { route: route, riddle: riddle.seadra, image: image });
// });

// app.get('/aparna', (req, res) => {
//     const route = req.route.path
//     const image = `/images/slowpoke.png`;
//     res.render('game', { route: route, riddle: riddle.slowpoke, image: image });
// });

// app.get(`/${code.snorlex}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/snorlax.png`;
//     res.render('game', { route: route, riddle: riddle.snorlax, image: image });
// });

// app.get(`/${code.squirtle}`, (req, res) => {
//     const route = req.route.path
//     const image = `/images/squirtle.png`;
//     res.render('game', { route: route, riddle: riddle.squirtle, image: image });
// });

// app.get('/karan', (req, res) => {
//     const route = req.route.path
//     const image = `/images/staryu.png`;
//     res.render('game', { route: route, riddle: riddle.staryu, image: image });
// });

// app.get('/harsh', (req, res) => {
//     const route = req.route.path
//     const image = `/images/tauros.png`;
//     res.render('game', { route: route, riddle: riddle.tauros, image: image });
// });

// app.get('/manya', (req, res) => {
//     const route = req.route.path
//     const image = `/images/voltorb.png`;
//     res.render('game', { route: route, riddle: riddle.voltorb, image: image });
// });

// app.get('/sarvam', (req, res) => {
//     const route = req.route.path
//     const image = `/images/vulpix.png`;
//     res.render('game', { route: route, riddle: riddle.vulpix, image: image });
// });

// app.get('/jatin', (req, res) => {
//     const route = req.route.path
//     const image = `/images/zapdos.png`;
//     res.render('game', { route: route, riddle: riddle.zapdos, image: image });
// });



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});