const Game = require('../models/game');
const Developer = require('../models/developer');
const Genre = require('../models/genre');

const async = require('async');
const { body, validationResult } = require('express-validator');
const developer = require('../models/developer');

// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, './uploads/')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.filename)
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true);
//     } else {
//         cb(new Error('Please upload jpg or png image.'), false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     limits: {
//         filesize: 1024 * 1024 * 5
//     },
//     fileFilter: fileFilter,
// });

exports.index = (req, res, next) => {
    async.parallel(
        {
            genre_count(callback) {
                Genre.countDocuments({}, callback);
            },
            game_count(callback) {
                Game.countDocuments({}, callback);
            },
            developer_count(callback) {
                developer.countDocuments({}, callback);
            }
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

        res.render('game_list', { title: "All Games", game_list: list_games});
    });
};

exports.game_detail = (req, res, next) => {
    Game.findById(req.params.id)
    .populate('genre')
    .populate('developer')
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
    async.parallel(
        {
            genres(callback) {
                Genre.find(callback);
            },
            developers(callback) {
                Developer.find(callback);
            }
        },
        (err, results) => {
            if (err) { return next(err) }

            res.render('game_form', { title: 'Add Game', genres: results.genres, developers: results.developers });
        }
    );
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
    .blacklist('<>'),

    body('developer', 'Select developer')
    .trim()
    .escape(),

    body('summary', 'Summary of game cannot be empty.')
    .trim() 
    .isLength({ min:1 })
    .blacklist('<>'),

    body('stock', 'Please include how many game copies are in stock.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    body('price', 'Price of game cannot be empty.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    body('genre.*').escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        console.log(req.file);
        const game = new Game(
            {
                name: req.body.name,
                developer: req.body.developer,
                summary: req.body.summary,
                genre: req.body.genre,
                stock: req.body.stock,
                price: req.body.price,
                image: req.body.image,
            }
        );

        if (!errors.isEmpty()) {
            async.parallel(
                {
                    genres(callback) {
                        Genre.find(callback);
                    },
                    developers(callback) {
                        Developer.find(callback);
                    }
                },
                (err, results) => {
                    if (err) { return next(err) }

                    for (const genre of results.genres) {
                        if (game.genre.includes(genre._id)) {
                            genre.checked = 'true';
                        }
                    }

                    res.render('game_form', { title: 'Add Game', genres: results.genres, developers:results.developers, game, errors: errors.array() });
                }
            );
            return;
        }
        game.save((err) => {
            if (err) { return next(err) }

            res.redirect(game.url);
        });
    }
];

exports.game_secret_get = (req, res, next) => {
    res.render('secret', { title: 'Secret Password' });
}

exports.game_secret_post = [
    body('password', 'Password incorrect')
    .trim()
    .isLength({ min:1 })
    .custom(val => {
        if (val.toLowerCase() === 'toadstool') return true;
        return false;
    })
    .escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('secret', { title: 'Secret Password', errors: errors.array() });
            return;
        } 

        res.redirect(`/catalog/game/${req.params.id}/delete`)
    }
];

exports.game_delete_get = (req, res, next) => {
    Game.findById(req.params.id).exec((err, results) => {
        if (err) { return next(err) }

        if (results == null) {
            res.redirect('/catalog/games');
        }

        res.render('game_delete', { title: 'Delete Game', game: results });
    });
};

exports.game_delete_post = (req, res, next) => {
    Game.findByIdAndRemove(req.body.gameid, (err) => {
        if (err) { return next(err) }

        res.redirect('/catalog/games');
    });
};

exports.game_update_get = (req, res, next) => {
   async.parallel(
    {
        game(callback) {
            Game.findById(req.params.id)
            .populate('genre')
            .populate('developer')
            .exec(callback);
        },
        developers(callback) {
            Developer.find(callback);
        },
        genres(callback) {
            Genre.find(callback);
        },
    },
    (err, results) => {
        if (err) { return next(err) }

        if (results.game == null) {
            const err = new Error('Game not found.');
            err.status = 404;
            return next(err);
        }

        for (const genre of results.genres) {
            for (const gameGenre of results.game.genre) {
                if (genre._id.toString() === gameGenre._id.toString()) {
                    genre.checked = 'true';
                }
            }
        }

        res.render('game_form', { title: 'Update Game', game: results.game, developers: results.developers, genres: results.genres });
    }
   );
};

exports.game_update_post = [
    (req, res, next) => {
        if (!Array.isArray(req.body.genre)) {
            req.body.genre = typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
        }
        next();
    },

    body('name', 'Name of game cannot be empty.')
    .trim() 
    .isLength({ min:1 })
    .blacklist('<>'),

    body('developer', 'Developer name cannot be empty.')
    .trim()
    .escape(),

    body('summary', 'Summary of game cannot be empty.')
    .trim() 
    .isLength({ min:1 })
    .blacklist('<>'),

    body('stock', 'Please include how many game copies are in stock.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    body('price', 'Price of game cannot be empty.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        const game = new Game(
            {
                name: req.body.name,
                developer: req.body.developer,
                summary: req.body.summary,
                genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
                stock: req.body.stock,
                price: req.body.price,
                image: req.body.image,
                _id: req.params.id,
            }
        );

        if (!errors.isEmpty()) {
            async.parallel(
                {
                    genres(callback) {
                        Genre.find(callback);
                    },
                    developers(callback) {
                        Developer.find(callback);
                    }
                },
                (err, results) => {
                    if (err) { return next(err) }

                    for (const genre of results) {
                        if (game.genre.includes(genre._id)) {
                            genre.checked = 'true';
                        }
                    }

                    res.render('game_form', { title: 'Add Game', genres: results.genres, developers:results.developers, game, errors: errors.array() });
                }
            );
            return;
        }

        Game.findByIdAndUpdate(req.params.id, game, {}, (err, thegame) => {
            if (err) { return next(err) }

            res.redirect(thegame.url);
        });
    }
];