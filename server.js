require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
// Basic Configuration
const port = process.env.PORT || 3000;

//app configurations



mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});


//Schema
var Urlschema = new Schema({
    original: { type: String, required: true }
});
//create model from schema
const TheUrl = mongoose.model('TheUrl', Urlschema);


//api endpoint for urlshortener
app.post("/api/shorturl", bodyParser.urlencoded({ extended: false }), async(req, res) => {

    console.log(req.body.url);
    let inputurl = req.body.url;

    // verify that input is url
    const verifyUrl = dns.lookup(urlParser.parse(inputurl).hostname, async(error, address) => {
        if (!address) {
            res.json({ error: 'invalid url' })
        } else {
            const url = new TheUrl({ original: inputurl })
            url.save((error, data) => {
                if (error) return console.log(error)
                res.json({
                    original_url: inputurl,
                    short_url: data.id
                })
            })

        }
    })




})

app.get('/api/shorturl/:input', async(req, res) => {
    let id = req.params.input;


    console.log(id)
    if (mongoose.Types.ObjectId.isValid(id)) {
        await TheUrl.findById((id), (error, result) => {

            if (!result) {
                res.json({
                    error: "url not found"
                })
            } else {
                let redirect = result.original
                console.log(redirect)
                res.redirect(301, redirect)
            }
        })
    }
    res.json({
        error: "url not found"
    })
})

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});