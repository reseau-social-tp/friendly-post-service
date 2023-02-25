require('dotenv').config({path:'./config/.env'});
const express = require('express');
const cors  = require("cors");
const post = require('./routes/post.routes');

require('./config/db');
const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', post)

app.use(express.static(__dirname + '/public'))

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log(`listen on port ${port}`);
});