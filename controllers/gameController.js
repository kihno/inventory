const Game = require('../models/game');
const Genre = require('../models/genre');

const async = require('async');

exports.index = (req, res) => {
    async.parallel(
        {
            genre_count(callback) {
                Genre.countDocuments({}, callback);
            },
            game_count(callback) {
                Game.countDocuments({}, callback);
            },
        },
        (err, results) => {
            res.render('index', {
                title: 'N64 Store',
                error: err,
                data: results,
            });
        }
    );
};

exports.game_list = (req, res, next) => {
    Game.find({}, )
    .sort({ name:1 })
    .populate()
    .exec(function (err, list_games) {
        if (err) { return next(err) }

        res.render('game_list', { title: "Game List", game_list: list_games});
    });
};

exports.game_detail = (req, res, next) => {
    Game.findById(req.params.id)
    .populate('genre')
    .exec(function (err, results) {
        if (err) { return next(err) }

        if (results == null) {
            const error = new Error('Game not found.');
            error.status = 404;
            return next(err);
        }

        res.render('game_detail', { title: results.name, game: results });
    });
};

exports.game_create_get = (req, res) => {
    res.send('NOT IMPLEMENTED: game create GET');
};

exports.game_create_post = (req, res) => {
    res.send('NOT IMPLEMENTED: game create POST');
};

exports.game_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: game delete GET');
};

exports.game_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: game delete POST');
};

exports.game_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: game update GET');
};

exports.game_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: game update POST');
};