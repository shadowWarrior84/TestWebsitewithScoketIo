require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const socket = require("socket.io");
const { test } = require("media-typer");
const e = require("express");

const app = express();

var name;
var name1;
var name2;
var final1;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    if(!req.session.initialize){
        req.session.initialize = true;
        req.session.name = '';
    }
    next();
})

app.use(function(req, res, next){
    res.locals.isAuth = req.isAuthenticated();
    next();
})


mongoose.connect("mongodb://localhost:27017/Test2DB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
})

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    desc: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

const Contact = new mongoose.model("Contact", contactSchema);

passport.use(User.createStrategy());


passport.serializeUser(function(user, done){
    done(null, user.id);
})

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.ClIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/dashboard",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb){
        console.log(profile);
    
        User.findOrCreate({googleId: profile.id}, function(err, user){
            name = profile.name.givenName;
            return cb(err, user)
        })
    }
))

// app.use(function(req, res, next) {
//     if (!req.user) {
//         res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//         res.header('Expires', '-1');
//         res.header('Pragma', 'no-cache');
//     }
//     next();
// });

app.get("/", function(req, res){
    // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    // res.header('Expires', '-1');
    // res.header('Pragma', 'no-cache');

    if(name2 === 1){
        const login1 = {
            login: 'true',
            name: name,
            alert: 'true'
        }
        res.render("home", {Suc: login1})
    }
    else{
        var success = {
            success: 'false'
        }
        res.render("home", {Suc: success});
    }
});


app.get("/auth/google", 
    passport.authenticate("google", {scope: ["profile"]})
);

app.get("/auth/google/dashboard",
    passport.authenticate("google", {failureRedirect: "/"}),
    function(req, res){
        name2 = 1;
        res.redirect("/home/"+name);
        // const login1 = {
        //     login: 'true',
        //     name: name
        // }
        // res.render("home", {Suc: login1});
    }
);

app.get("/home", function(req, res){
    // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    // res.header('Expires', '-1');
    // res.header('Pragma', 'no-cache');

    if(name1 === 1){
        const login2 = {
            login: 'true',
            name: req.session.name
        }
        res.render("home", {Suc: login2})
    }
    else if(name2 === 1){
        const login3 = {
            login: 'true',
            name: name,
        }
        res.render("home", {Suc: login3})
    }
    else{
        const nothing = {
            no: 'ok'
        }

        res.render("home", {Suc:nothing});
    }
});

app.get("/home/:final", function(req, res){
    // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    // res.header('Expires', '-1');
    // res.header('Pragma', 'no-cache');

    if(name1 === 1){
        const login2 = {
            login: 'true',
            name: req.params.final,
            alert: 'true'
        }
        res.render("home", {Suc: login2})
    }
    else if(name2 === 1){
        const login3 = {
            login: 'true',
            name: name,
            alert: 'true'
        }
        res.render("home", {Suc: login3})
    }
    else{
        const nothing = {
            no: 'ok'
        }

        res.render("home", {Suc:nothing});
    }
});



app.get("/dashboard/:final1", function(req, res){
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    if(req.isAuthenticated()){
        const aqe = req.params.final1

        const dash = {
            name: aqe,
            minutes: minutes,
            hours: hours,
            seconds: seconds
        }

        res.render("dashboard", {name: dash});
        // res.render("dashboard", {name: aqe});
    }
    else{
        res.redirect("/");
    }
})

app.get("/contactus", function(req, res){
    const query2 = {
        query: 'no'
    }
    res.render("contactus", {que: query2});
})

app.get("/aboutus", function(req, res){
    res.render("aboutus");
})

app.get("/login", function(req, res){
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    if(req.isAuthenticated()){
        res.redirect("/home");
    }
    else{
        res.redirect("/");
    }
})

app.post("/contactus", function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const desc = req.body.query;

    const contact = new Contact({
        name: name,
        email: email,
        phone: phone,
        desc: desc
    });

    contact.save(function(err){
        if(err){
            console.log(err);
            const query1 = {
                query1: 'fail'
            }
            res.render("contactus", {que: query1});
        }
        else{
            const query= {
                query: 'true'
            };
            res.render("contactus", {que: query});
        }
    })

})

app.post("/signup", function(req, res){

        if(req.body.password === req.body.cpassword){
             User.register({username: req.body.username}, req.body.password, function(err, user){
                if(err){
                    console.log(err);
                        const exist = {
                            exist: 'true'
                        }
                        res.render("home", {Suc: exist});
                    }
                    else{
                        
                        passport.authenticate("local")(req, res, function(){
        
                            const success = {
                                success: 'true'
                            }
                            res.render("home", {Suc: success});
                        })                                             
                    }
                })
            }
            else{
                // passport.authenticate("local")(req, res, function(){
        
                     const failure = {
                            failure: 'true'
                        }
                        res.render("home", {Suc: failure});
                    // })
                }

});

app.get("/logout", function(req, res){
    req.logout();
    name1 = 0;
    name2 = 0;
    res.redirect("/");
})

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/home");
            // const error1 = {
            //     error1: 'true'
            // }
            // res.render("home", {Suc: error1});
        }
        else{

            passport.authenticate("local")(req, res, function(err){ 

                if(err){
                    const error1 = {
                        error1: 'true'
                    }
                    res.render("home", {Suc: error1});
                }


                else{
                    const login = {
                        login: 'true',
                        name: req.body.username,
                        alert: 'true'
                    }
                    name = req.body.username;
                    req.session.name = name;
                    name1 = 1;
                    final1 = name;
                    res.redirect("/home/"+name);
                    // res.render("home", {Suc: login});
                    // res.render("dashboard", {name: req.body.username});
                }
            })
            
        }
    });
});

app.use(function(req, res, next){
    res.locals.user = name;
    next();
})

const server = app.listen(3000, function(){
    console.log("Server started on port 3000");
});

const io = socket(server);

io.on("connection", function(socket){
    console.log("made socket connection")

    socket.on("chat", function(data){
        io.sockets.emit("chat", data);
    });

    socket.on("typing", function(data){
        socket.broadcast.emit("typing", data);
    });
});