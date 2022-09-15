const Genre = require('../models/genre');
const Game = require('../models/game');

const async = require('async');
const { game_list } = require('./gameController');

exports.genre_list = (req, res) => {
    Genre.find({}, )
    .sort({ name:1 })
    .populate()
    .exec(function (err, list_genres) {
        if (err) { return next(err) }

        res.render('genre_list', { title: "Genres", genre_list: list_genres});
    });
};

exports.genre_detail = (req, res, next) => {
    async.parallel(
        {
            genre(callback) {
                Genre.findById(req.params.id).exec(callback);
            },
            genre_games(callback) {
                Game.find({ genre: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) { return next(err) }

            if (results.genre == null) {
                const err = new Error('Genre not found.');
                err.status = 404;
                return next(err);
            }

            res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_games: results.genre_games });
        }
    );
};

exports.genre_create_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre create GET');
};

exports.genre_create_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre create POST');
};

exports.genre_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

exports.genre_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

exports.genre_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

exports.genre_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update POST');
};