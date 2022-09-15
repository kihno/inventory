const Game = require('../models/game');
const Genre = require('../models/genre');

const async = require('async');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const genre = require('../models/genre');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.filename)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Please upload jpg or png image.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        filesize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter,
});

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

exports.game_create_get = (req, res, next) => {
    Genre.find((err, genres) => {
        if (err) { return next(err) }

        res.render('game_form', { title: 'Add Game', genres: genres})
    });
};

exports.game_create_post = [
    (req, res, next) => {
        if (!Array.isArray(req.body.genre)) {
            req.body.genre = typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
        }
        next();
    },

    body('name', 'Name of game cannot be empty.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    body('summary', 'Summary of game cannot be empty.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    body('stock', 'Please include how many game copies are in stock.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    body('price', 'Price of game cannot be empty.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    upload.single('image'),

    (req, res, next) => {
        const errors = validationResult(req);

        console.log(req.file);
        const game = new Game(
            {
                name: req.body.name,
                summary: req.body.summary,
                genre: req.body.genre,
                stock: req.body.stock,
                price: req.body.price,
  
            }
        );

        if (!errors.isEmpty()) {
            Genre.find((err, results) => {
                if (err) { return next(err) }

                for (const genre of results) {
                    if (game.genre.includes(genre._id)) {
                        genre.checked = 'true';
                    }
                }

                res.render('game_form', { title: 'Add Game', genres: results, game, errors: errors.array() });
            });
            return;
        } else {
            game.save((err) => {
                if (err) { return next(err) }

                res.redirect(game.url);
            });
        }
    }
];

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