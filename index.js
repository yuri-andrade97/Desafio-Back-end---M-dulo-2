const express = require('express');

const app = express();

const data = require('./data/data.json')



app.use(express.json());

app.get('/produtos', (req, res) => {
    res.json(data.produtos);
});

app.listen(8000);