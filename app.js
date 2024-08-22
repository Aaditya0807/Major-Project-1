if(process.env.NODE_ENV !='production'){
  require('dotenv').config();
}

const express = require("express");
const { faker, id_ID } = require('@faker-js/faker');
const app = express();
const path = require("path");
const mysql = require("mysql2");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const session = require('express-session');
const  {jwtAuthMiddleware, generateToken} = require("./jwt");
const Listing = require("./models/listings");
const cookieParser = require('cookie-parser');
const ejsMate = require("ejs-mate");

const port = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.engine("ejs", ejsMate);
app.use(flash());

let getRandomUser = () =>{
    return [
      faker.string.uuid(),
    ];
  };
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
  }));
  app.use((req, res, next) => {
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
  });

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "major-project-1",
    password: process.env.PASSWORD,
});

// try{
//     connection.query("SHOW TABLES", (err, result) =>{
//         if(err) throw err;
//         console.log(result);
//     });
// } catch(err){
//     console.log(err);
// };
// connection.end();



//root
app.use("/", require("./routes/pages"));

//home page
app.use("/home" , require("./routes/pages"));

//login page
app.use("/home/login" , require("./routes/pages"));

//new user
app.post("/home", (req, res) => {
  let { username, mobile, email, confirmpass, password} = req.body;
  const id = faker.string.uuid();
  const q2 = `SELECT username FROM users WHERE username = ?`;
  connection.query(q2, [username], async(err, result) =>{
      if(err){
          console.log(err);
      }
      if(result.length > 0){
          return res.render("create.ejs", {
              message: "That username is already in use"
          })
      } else if( password !==confirmpass){
          return res.render("create.ejs", {
              message : "Password do not match"
          });
      }
      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);

      const q = `INSERT INTO users (id, username, email, password, confirmpass, mobile) VALUES (?, ?, ?, ?, ?, ?)`;
  connection.query(q, [id, username, email, hashedPassword, confirmpass, mobile], (err, result) => {
      if(err){
          console.log("error inserting data:" , err);
          res.status(500).send("server error");
          return;
      }
      res.redirect("/home");
      console.log("Data saved");

      // const payload = {
      //   id: id,
      //   username: username
      // }
      // console.log(JSON.stringify(payload));
      // const token = generateToken(payload);
      // console.log("Token is: ", token);

      // res.status(200).json({token: token});
  });
  }); 
});

//login route
app.post("/home/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('error', 'Username and password are required');
    return res.redirect('home/login');
  }

  const query = 'SELECT id, confirmpass FROM users WHERE username = ?';
  connection.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      req.flash('error', 'Internal server error');
      return res.redirect('home/login');
    }

    if (results.length === 0) {
      req.flash('error', 'User not found');
      return res.redirect('home/login');
    }

    const userId = results[0].id;
    const hashedPassword = results[0].confirmpass;

    if (!hashedPassword) {
      console.error('Error: Retrieved hashed password is undefined or empty');
      req.flash('error', 'Internal server error');
      return res.redirect('home/login');
    }

    console.log('Entered password:', password);
    console.log('Hashed password from database:', hashedPassword);

    try {
      // const isMatch = await bcrypt.compare(password, hashedPassword);
      const isMatch = (password === hashedPassword);
      console.log('Comparison result:', isMatch);

      if (isMatch) {
        const payload = { id: userId, username: username };
        const token = generateToken(payload);

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/home/listings');
      } else {
        req.flash('error', 'Incorrect password');
        return res.redirect('home/login');
      }
    } catch (err) {
      console.error('Error comparing passwords:', err);
      req.flash('error', 'Internal server error');
      return res.redirect('home/login');
    }
  });
});


    //dashboard
    app.use("/home/listings", require("./routes/pages"));

    //new route
    app.use("/listings/new",  require("./routes/pages"));

    //show route
    app.use("/listings/:id", require("./routes/pages"));

    //create route
    app.post("/listings", async(req,res) => {
      const {title, company, location, type, salary, description} = req.body;
      let q = `INSERT INTO jobs(title, company, location, type, salary, description) VALUES(?, ?, ?, ?, ?, ?)`;
      connection.query(q, [title, company, location, type, salary, description], (err,results) => {
        if(err){
          console.error("error executing sql query", err); 
        }else{
          console.log(results);
        }
        res.redirect("/home/listings");
      });
    });

    //Edit route
    app.use("/listings/:id/edit",  require("./routes/pages"));

    //update route
    app.put("/listings/:id",  async(req,res) => {
      const { id } = req.params;
      const {title, company, location, type, salary, description} = req.body;
      let q = `UPDATE jobs SET title = ?,company = ?, location = ?, type = ?, salary = ?, description = ? WHERE id = ?`; 
      connection.query(q, [title, company, location, type, salary, description, id], (err,results) => {
        if(err){
          console.error("error executing sql query", err); 
        }else{
          console.log(results);
        }
        res.redirect(`/listings/${id}`);
      });
    }); 

    //Delete route
    app.delete("/listings/:id", (req, res) => {
      let { id } = req.params;
      let q = `DELETE FROM jobs WHERE id = ?`;
       connection.query(q, [id], (err, results) => {
        if (err) throw err;
        res.redirect('/home/listings');
       });
    });

    //filter route
    // app.get("/home/listings", (req, res) => {
    //   const locations = req.query.location;
    //   if(!locations){
    //     return res.status(400);
    //   }
    //   let q = `SELECT * FROM JOBS WHERE location IN (?)`;
    //   connection.query(q, [locations], (err, results) => {
    //     if(err){
    //       return res.status(500).send("Database query failed");
    //     }
    //     res.redirect('/home/listings');
    //   });
    // });

  //logout cookie destroy
  app.post('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token');
    
    // Redirect to login page or home page
    res.redirect('/home');
  });
  


app.listen(port, () =>{
    console.log("Listening to port 8080");
});

