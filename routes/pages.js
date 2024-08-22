if(process.env.NODE_ENV !='production'){
    require('dotenv').config();
  }
  
const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const  {jwtAuthMiddleware, generateToken} = require("../jwt");
const cookieParser = require('cookie-parser');
const methodOverride = require("method-override");



let getRandomUser = () =>{
    return [
      faker.string.uuid(),
    ];
  };

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "major-project-1",
    password: process.env.PASSWORD,
});

//root
router.get("/",jwtAuthMiddleware, (req, res) => {
    res.send("This is root");
});

//home page
router.get("/home", (req, res) => {
    res.render("home.ejs");
});

//login
router.get("/home/login", (req,res) => {
    res.render("login.ejs");
});

//create account
router.get("/home/register", (req, res) => {
    res.render("create.ejs");
});

//dashboard
router.get("/home/listings", jwtAuthMiddleware, (req,res) => {
    let q = `SELECT * FROM jobs`;
    try{
        connection.query(q, (err, users) => {
            if(err) throw  err;
            res.render("listings.ejs", { users });
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
});

//new route
router.get("/listings/new",jwtAuthMiddleware, (req, res) => {
    res.render("new.ejs");
});

//show route
router.get("/listings/:id",jwtAuthMiddleware, async(req,res) => {
    let {id} = req.params;
    let q = `SELECT * FROM jobs WHERE id = ?`;
    connection.query(q, [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        const job = results[0]; // Get the first (and presumably only) result
        res.render("show.ejs", { job });
    });
});

//edit route
router.get("/listings/:id/edit", jwtAuthMiddleware, (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM jobs WHERE id = ?`;
    connection.query(q, [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        const job = results[0]; // Get the first (and presumably only) result
        res.render("edit.ejs", { job });
    });
});






module.exports = router;