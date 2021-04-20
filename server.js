'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
// Specify a directory for static resources
app.use(express.static('./public'));
// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine', 'ejs');
// Use app cors
app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/', getQuotesformAPI);
app.post('/favorite', addToFavorite);
app.get('/favorite-quotes', renderFavQuotes);
app.post('/favorite-quotes/:quote_id', viewDetails);
app.put('/favorite-quotes/:quote_id', update);
app.delete('/favorite-quotes/:quote_id', deleteSimpsons);


// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function getQuotesformAPI(req, res) {
    const url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', '1.0').then(results => {
        //console.log(results.body);
        const quotes = results.body.map(quote => {
            return new Quote(quote);
        });
        res.render('index', { quotes: quotes });
    }).catch(error => {
        console.error(error);
    });
}

function addToFavorite(req, res) {
    const { character_name, quote, image, character_direction } = req.body;

    const sql = 'INSERT INTO simpsons_quotes(character_name, quote, image, character_direction)VALUES($1,$2,$3,$4);';
    const values = [character_name, quote, image, character_direction];

    client.query(sql, values).then(() => {
        res.redirect('/favorite-quotes');
    });
}

function renderFavQuotes(req, res) {

    const sql = 'select * from simpsons_quotes;';

    client.query(sql).then(result => {
        res.render('favorite-quotes', { quotes: result.rows });
    })

}

function viewDetails(req, res) {
    const id = req.params.quote_id;
    // console.log(id);

    const sql = 'SELECT * FROM simpsons_quotes WHERE id=$1;';
    const value = [id];

    client.query(sql, value).then((result) => {
        res.render('details', { quotes: result.rows });
    })
}

function update(req, res) {
    const id = req.params.quote_id;
    const quote = req.body.quote;
    const sql = 'UPDATE simpsons_quotes SET quote=$1 WHERE id=$2;';
    const value = [quote, id];

    client.query(sql, value).then(() => {
        res.redirect('/favorite-quotes');
    });
}

function deleteSimpsons(req, res) {
    const id = req.params.quote_id;
    const sql = 'DELETE FROM simpsons_quotes where id=$1;';
    const value = [id];

    client.query(sql, value).then(() => {
        res.redirect('/favorite-quotes');
    });

}
// helper functions
function Quote(data) {
    this.quote = data.quote || 'No quote here';
    this.character_name = data.character || 'Character Not Provided'
    this.image = data.image
    this.character_direction = data.characterDirection;
}
// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);