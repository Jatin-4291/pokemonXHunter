require("dotenv").config({ path: "./.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const request = require("request");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const riddle = require("./riddle");
const codes = require("./code");
const pokemon = require("./pokemon");
const path1 = require("./path1");
const path2 = require("./path2");
const path3 = require("./path3");
const hint = require("./hint");
const routes = require("./route");

const app = express();
const PORT = 4000;

// Set public folder as static folder for static files
app.use(express.static(__dirname + "/public"));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Express session setup
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure: true if using HTTPS in production
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Error handling for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception!", err);
  process.exit(1);
});

// MongoDB connection setup
const dbUrl = process.env.DB_URI.replace("<db_password>", process.env.DB_PASS);
console.log(dbUrl);

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Error handling for unhandled promise rejections

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
  next: String,
  requestCount: { type: Number, default: 0 }, // Add this field
  disqualifies: { type: Boolean, default: false },
});
teamSchema.plugin(passportLocalMongoose, { usernameField: "email" });
const team = mongoose.model("team", teamSchema); // team schema is made
passport.use("team-local", team.createStrategy());
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

adminSchema.plugin(passportLocalMongoose);

const admin = mongoose.model("admin", adminSchema); //admin schema is made

passport.use(admin.createStrategy());
// passport.serializeUser(admin.serializeUser());
// passport.deserializeUser(admin.deserializeUser());
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// app.get('/setup', (req, res) => {
//     team.updateMany({}, { $set: { points: 0 } }).then(() => {
//         res.send('done');
//     });
// })

app.get("/", (req, res) => {
  res.render("index");
});

//get user

app.get("/admin", (req, res) => {
  if (req.isAuthenticated()) {
    var members = 0;
    team.find().then((data) => {
      data.forEach((tm) => {
        members += 1;
        if (tm.member2 != "") {
          members += 1;
        }
        if (tm.member3 !== "") {
          members += 1;
        }
        if (tm.member4 !== "") {
          members += 1;
        }
        if (tm.member5 !== "") {
          members += 1;
        }
      });
      res.render("admin", { noOfParticipants: members });
    });
  } else {
    res.redirect("/admin/login");
  }
});

//point updation

app.post("/admin/card-submit", (req, res) => {
  const email = req.body.email;

  team
    .updateOne({ email: email }, { $inc: { points: 3 } })
    .then(() => {
      res.send("Points updated");
    })
    .catch((err) => {
      console.log(err);
    });
});

//admin registration
app.get("/admin/register", (req, res) => {
  res.render("adminRegister", { message: "" });
});

app.post("/admin/register", (req, res) => {
  if (req.body.username === "" || req.body.password === "") {
    res.render("adminRegister", {
      message: "Please fill all the required fields",
    });
  } else if (req.body.password.length < 8) {
    res.render("adminRegister", {
      message: "Password should be atleast 8 characters long",
    });
  } else {
    admin
      .register({ username: req.body.username }, req.body.password)
      .then((adm) => {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/admin");
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/register");
      });
  }
});
//admin login
app.get("/admin/login", (req, res) => {
  res.render("adminLogin");
});

app.post("/admin/login", (req, res) => {
  const adm = new admin({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(adm, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/admin");
      });
    }
  });
});
//admin logout
app.post("/admin/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/admin/login");
    }
  });
});
//admin scoreboard
app.get("/admin/scoreboard", (req, res) => {
  if (req.isAuthenticated()) {
    team
      .find()
      .sort({ points: "desc" })
      .then((data) => {
        res.render("scoreboard", { data: data });
      });
  } else {
    res.redirect("/admin/login");
  }
});
//delete user
app.post("/admin/delete/:id", (req, res) => {
  team.findByIdAndRemove(req.params.id).then(() => {
    res.redirect("/admin/scoreboard");
  });
});

//edit user
app.post("/admin/edit/:id", (req, res) => {
  team.findById(req.params.id).then((data) => {
    res.render("edit", { data: data });
  });
});
//send mail
app.post("/start", async (req, res) => {
  try {
    const data = await team.find();

    for (let i = 0; i < data.length; i++) {
      // Create a transporter for each email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.EMAIL}`,
          pass: `${process.env.PASSWORD}`,
        },
      });

      const mail = {
        from: `${process.env.EMAIL}`,
        to: `${data[i].email}`,
        subject: "Game Started",
        html: `
          <h1>Your First Clue is here GOOD LUCK for the Game</h1>
          <div>
            ${riddle[data[i].next]}
          </div>
          <div>
            https://strong-presence-production.up.railway.app/riddle/${
              data[i].next
            }
          </div>
          <div>
            <h2>Contacts for any query</h2>
            <p>IEEE YMCA SB JSEC - Daniyal Jawed - 6287912722</p>
            <p>IEEE SIGHT SB Chairperson - Nishant - 9896774495</p>
            <p>IEEE WIE SB Chairperson - Asif - 9560491809</p>
          </div>
        `,
      };

      // Use setTimeout to add delay
      setTimeout(async () => {
        try {
          await transporter.sendMail(mail);
          console.log(`Mail sent to ${data[i].email}`);
          // Send a response after the last email is sent
          if (i === data.length - 1) {
            res.render("message", { message: "All Mails Sent" });
          }
        } catch (err) {
          console.error(`Error sending mail to ${data[i].email}:`, err);
        }
      }, i * 1000); // Delay each email by 1000ms (1 second)
    }
  } catch (err) {
    console.error("Error fetching team data:", err);
    res.status(500).send("Error starting the game.");
  }
});
// explicitly start
app.post("/start-single", async (req, res) => {
  const email = req.body.email;
  team.findOne({ email: email }).then(async (data) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.PASSWORD}`,
      },
    });

    let mail = {
      from: `${process.env.EMAIL}`,
      to: `${email}`,
      subject: "Game Started",
      html: `
          <h1>Your First Clue is here GOOD LUCK for the Game</h1>
          <div>
            ${riddle[data[i].next]}
          </div>
          <div>
            https://strong-presence-production.up.railway.app/riddle/${
              data[i].next
            }
          </div>
          <div>
            <h2>Contacts for any query</h2>
            <p>IEEE YMCA SB JSEC - Deepak - 9821287225</p>
            <p>IEEE WIE YMCA Secretary - Vinarm - 8168585381</p>
            <p>IEEE WIE YMCA Vice Chairperson - Jatin Dua - 8810575463</p>
          </div>
          `,
    };

    await transporter.sendMail(mail, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.redirect("/admin");
      }
    });
  });
});

app.post("/edit", (req, res) => {
  const email = req.body.email;

  team
    .findOneAndUpdate({ email: email }, { next: req.body.next })
    .then(() => {
      res.redirect("/admin/scoreboard");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Something went wrong");
    });
});

app.get("/register", (req, res) => {
  // res.render('register-end');
  res.render("register", { message: "" });
});

//register user
app.post("/register", async (req, res) => {
  const teamName = req.body.teamName;
  const leaderName = req.body.leaderName;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const member2 = req.body.member2;
  const member3 = req.body.member3;
  const member4 = req.body.member4;
  const member5 = req.body.member5;
  console.log(email, member5);

  if (
    teamName === "" ||
    leaderName === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === "" ||
    member2 === ""
  ) {
    return res.render("register", {
      message: "Please fill all the required fields",
    });
  } else if (!email.includes("@") || !email.includes(".")) {
    return res.render("register", { message: "Please enter a valid email" });
  } else if (password !== confirmPassword) {
    return res.render("register", { message: "Passwords don't match" });
  }
  console.log("yo");

  try {
    const existingTeam = await team.findOne({ email: email });
    console.log(existingTeam);

    if (existingTeam) {
      return res.render("register", { message: "Email already registered" });
    }

    // Register the new team with passport-local-mongoose
    const newTeam = new team({
      teamName: teamName,
      leaderName: leaderName,
      email: email,
      member2: member2,
      member3: member3,
      member4: member4,
      member5: member5,
      points: 0,
      next: pokemon[Math.floor(Math.random() * pokemon.length)],
    });
    console.log(newTeam);

    await team.register(newTeam, password);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.PASSWORD}`,
      },
    });

    let mail = {
      from: `${process.env.EMAIL}`,
      to: `${email}`,
      subject: "Team Registered Successfully",
      html: `
       <div>
          <h1>Team Registered Successfully</h1>
          <p>Team Name: ${teamName}</p>
          <p>Leader Name: <b>${leaderName}</b></p>
          <p>Team Members: <b>${member2}</b> <br> <b>${member3}</b> <br> <b>${member4}</b> <br> <b>${member5}</b></p>
          <p>Join our WhatsApp group to stay updated: https://chat.whatsapp.com/CfkbEJbVQAUCJgLcHiXUtT</p>
        </div>
        <div>
          <h2>Contacts</h2>
          <p>IEEE YMCA SB JSEC - Deepak - 9821287225</p>
          <p>IEEE WIE YMCA Secretary - Vinarm - 8168585381</p>
          <p>IEEE WIE Vice Chairperson - Jatin Dua -  8810575463</p>
        </div>
      `,
      attachments: [
        {
          filename: "GUIDELINES.docx",
          path: "./public/GUIDELINES.docx",
          contentType: "application/docx",
        },
        {
          filename: "pokemon x hunter 2.png",
          path: "./public/pokemon x hunter 2.png",
          contentType: "application/png",
        },
      ],
    };

    await transporter.sendMail(mail);

    res.render("confirm");
  } catch (err) {
    console.error(err);
    res.redirect("/register");
  }
});
// explicitly register
app.get("/admin/registerteam", (req, res) => {
  res.render("register", { message: "" });
});

app.post("/admin/registerteam", async (req, res) => {
  if (req.isAuthenticated()) {
    const teamName = req.body.teamName;
    const leaderName = req.body.leaderName;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const member2 = req.body.member2;
    const member3 = req.body.member3;
    const member4 = req.body.member4;
    const member5 = req.body.member5;

    if (
      teamName === "" ||
      leaderName === "" ||
      email === "" ||
      password === "" ||
      confirmPassword === "" ||
      member2 === ""
    ) {
      res.render("register", {
        message: "Please fill all the required fields",
      });
    } else if (!email.includes("@") || !email.includes(".")) {
      res.render("register", { message: "Please enter a valid email" });
    } else if (password !== confirmPassword) {
      res.render("register", { message: "Passwords don't match" });
    } else if (password.length < 8) {
      res.render("register", {
        message: "Password should be atleast 8 characters long",
      });
    } else {
      team.findOne({ email: email }).then((err, data) => {
        if (data) {
          res.render("register", { message: "Email already registered" });
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
        next: pokemon[Math.floor(Math.random() * pokemon.length)],
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.EMAIL}`,
          pass: `${process.env.PASSWORD}`,
        },
      });

      let mail = {
        from: `${process.env.EMAIL}`,
        to: `${email}`,
        subject: "Team Registered Successfully",
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
            filename: "GUIDELINES.docx",
            path: "./public/GUIDELINES.docx",
            contentType: "application/docx",
          },
          {
            filename: "HunterXPokemon.png",
            path: "./public/HunterXPokemon.png",
            contentType: "application/png",
          },
        ],
      };

      await transporter.sendMail(mail, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      });

      newTeam
        .save()
        .then(() => {
          res.redirect("/admin");
        })
        .catch(() => {
          res.redirect("/register");
        });
    }
  } else {
    res.redirect("/admin/login");
  }
});

//last riddle question
app.get("/riddle/ankur", (req, res) => {
  res.render("message", {
    message: "Meet me at Computer Department, Ankur Yadav",
  });
});

app.get("/riddle/mohan", (req, res) => {
  res.render("message", { message: "Meet me at the Mother Dairy, Mohan(M.K)" });
});

app.get("/riddle/hemang", (req, res) => {
  res.render("message", {
    message: "Meet me at the front of Mechanical Department, Hemang",
  });
});

// getRiddle
app.get("/riddle/:code", (req, res) => {
  const route = routes[req.params.code];
  res.render("riddle", { route: route, riddle: riddle[req.params.code] });
});

app.get(`/:code`, (req, res) => {
  const route = req.params.code;
  const image = `/images/${codes[req.params.code]}.png`;
  res.render("game", {
    route: route,
    riddle: riddle[codes[req.params.code]],
    image: image,
  });
});
//answer riddle
app.post(`/:code`, async (req, res) => {
  try {
    const email = req.body.email;
    const data = await team.findOne({ email: email });

    if (!data) {
      return res.status(404).render("message", { message: "User not found" });
    }

    if (data.disqualified) {
      return res.render("message", { message: "You are disqualified" });
    }

    if (data.requestCount >= 25) {
      await team.updateOne({ email: email }, { $set: { disqualified: true } });
      return res.render("message", { message: "Disqualified" });
    }

    const nxt = data.next;
    const code = codes[req.params.code];

    // Update request count regardless of the answer's correctness
    await team.updateOne({ email: email }, { $inc: { requestCount: 1 } });

    if (nxt != code) {
      return res.render("message", { message: "Wrong Answer" });
    }

    // Determine the next path based on the code
    let nextPath;
    if (path1[code] != undefined) {
      nextPath = path1[nxt];
    } else if (path2[code] != undefined) {
      nextPath = path2[nxt];
    } else if (path3[code] != undefined) {
      nextPath = path3[nxt];
    } else {
      return res.render("message", { message: "Path not found" });
    }

    // Update team data with points and the next path since the answer is correct
    await team.updateOne(
      { email: email },
      { $inc: { points: 1 }, $set: { next: nextPath } }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.PASSWORD}`,
      },
    });

    const mail = {
      from: `${process.env.EMAIL}`,
      to: `${email}`,
      subject: "HunterXPokemon",
      html: `
       <h1>Your First Clue is here GOOD LUCK for the Game</h1>
          <div>
            ${riddle[data[i].next]}
          </div>
          <div>
            https://strong-presence-production.up.railway.app/riddle/${
              data[i].next
            }
          </div>
          <div>
            <h2>Contacts for any query</h2>
            <p>IEEE YMCA SB JSEC - Deepak - 9821287225</p>
            <p>IEEE WIE YMCA Secretary - Vinarm - 8168585381</p>
            <p>IEEE WIE YMCA Vice Chairperson - Jatin Dua - 8810575463</p>
          </div>
      `,
    };

    transporter.sendMail(mail, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).send("Error sending email");
      } else {
        console.log("Email sent:", info);
      }
    });

    // Render the riddle page after sending the email
    res.render("riddle", { riddle: riddle[nextPath] });
  } catch (error) {
    console.error("Error in route:", error);
    res.status(500).send("Something went wrong");
  }
});
// app.get('/hint/:code', (req, res) => {
//     const image = `/images/${codes[req.params.code]}.png`
//     res.render('hint', { image: image, code: req.params.code });
// });

// app.post('/hint/:code', (req, res) => {
//     const email = req.body.email;
//     const pass = req.body.password;
//     team.findOne({ email: email }).then((data) => {
//         if(pass != data.password){
//             res.render('message',{message: "Wrong Password"});
//         }
//         if (data.hintsLeft === 0) {
//             res.render('message', {message: "No hints Left"});
//         }
//         else {
//             team.updateOne({ email: email }, { $inc: { hintsLeft: -1 }, $inc : {points : -1} }).then(() => {
//                 res.render('message', { message: hint[codes[req.params.code]] });
//             }).catch((err) => {
//                 console.log(err);
//                 res.status(500).send('Something went wrong');
//             });
//         }
//     });
// });

// app.post('/hint-single',(req,res)=>{
//     const email = req.body.email;
//     const hnts = Number.parseInt(req.body.hint);

//     team.findOne({email:email}).then((data)=>{
//         team.updateOne({email:email},{$inc:{hintsLeft:hnts}}).then(()=>{
//             res.redirect('/admin');
//         }).catch((err)=>{
//             console.log(err);
//             res.status(500).send('Something went wrong');
//         });
//     });
// });
