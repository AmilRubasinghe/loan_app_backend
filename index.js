const express = require('express');
var cors =require('cors')
const connection = require("./connection");
const loanRoute = require('./routes/loan')
const userRoute = require('./routes/user')

const app = express();
app.use(cors());
app.use('/files', express.static('files'));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use('/loan', loanRoute)
app.use('/user', userRoute)




module.exports = app;