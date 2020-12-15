const express = require('express');
const app = express();
const PORT = 4444;
const {getData} = require('./getdata');
var fs = require('fs');


(async()=>{
   await getData();
})();


app.listen(PORT);