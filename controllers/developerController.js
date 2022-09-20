const Developer = require('../models/developer');
const Genre = require('../models/genre');
const Game = require('../models/game');

const async = require('async');
const { body, validationResult } = require('express-validator');

exports.developer_list = (req, res) => {
    Developer.find({}, )
    .sort({ name:1 })
    .exec(function (err, list_developers) {
        if (err) { return next(err) }

        res.render('developer_list', { title: "Developers", dev_list: list_developers});
    });
};

exports.developer_detail = (req, res, next) => {
    async.parallel(
        {
            developer(callback) {
                Developer.findById(req.params.id).exec(callback);
            },
            developers_games(callback) {
                Game.find({ developer: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) { return next(err) }

            if (results.developer == null) {
                const err = new Error('Developer not found.');
                err.status = 404;
                return next(err);
            }

            res.render('developer_detail', { title: 'Developer Detail', developer: results.developer, developer_games: results.developers_games });
        }
    );
};

exports.developer_create_get = (req, res) => {
    res.render('developer_form', { title: 'Add Developer' });
};

exports.developer_create_post = [
    body('name', 'Developer name required.')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    body('country', 'Developer country is required.')
    .trim()
    .isLength({ min:1 })
    .escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        const developer = new Developer(
            {
                name: req.body.name,
                country: req.body.country,
                logo: req.body.logo,
            }
        );

        if (!errors.isEmpty()) {
            res.render('developer_form', { title: 'Add Developer', developer, errors: errors.array() });
            return;
        } else {
            Developer.findOne({ name: req.body.name }).exec((err, found_developer) => {
                if (err) { return next(err) }

                if (found_developer) {
                    res.redirect(found_developer.url);
                } else {
                    developer.save((err) => {
                        if (err) { return next(err) }

                        res.redirect(developer.url);
                    });
                }
            });
        }
    }
];

exports.developer_secret_get = (req, res, next) => {
    res.render('secret', { title: 'Secret Password' });
}

exports.developer_secret_post = [
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

        res.redirect(`/catalog/developer/${req.params.id}/delete`)
    }
];

exports.developer_delete_get = (req, res, next) => {
    async.parallel(
        {
            developer(callback) {
                Developer.findById(req.params.id).exec(callback);
            },
            developer_games(callback) {
                Game.find({ developer: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) { return next(err) }

            if (results.developer == null) {
                res.redirect('/catalog/developers');
            }

            res.render('developer_delete', { title: 'Delete Developer', developer: results.developer, developer_games: results.developer_games })
        }
    );
};

exports.developer_delete_post = (req, res, next) => {
    async.parallel(
        {
            developer(callback) {
                Developer.findById(req.body.developerid).exec(callback);
            },
            developers_games(callback) {
                Game.find({ developer: req.body.developerid }).exec(callback);
            },
        },
        (err, results) => {
            if (err) { return next(err) }

            if(results.developers_games.length > 0) {
                res.render('developer_delete', { title: 'Delete Developer', developer: results.developer, developer_books: results.developers_books });
                return;
            }

            Developer.findByIdAndRemove(req.body.developerid, (err) => {
                if (err) { return next(err) }
        
                res.redirect('/catalog/developers');
            });
        }
    );
};

exports.developer_update_get = (req, res, next) => {
    Developer.findById(req.params.id).exec((err, developer) => {
        if (err) { return next(err) }

        if (developer == null) {
            const err = new Error('Developer not found.');
            err.status = 404;
            return next(err);
        }

        res.render('developer_form', { title: 'Update Developer', developer });
    });
};

exports.developer_update_post = [
    body('name', 'Developer name required')
    .trim() 
    .isLength({ min:1 })
    .escape(),

    body('country', 'Developer country is required.')
    .trim()
    .isLength({ min:1 })
    .escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        const developer = new Developer(
            {
                name: req.body.name,
                country: req.body.country,
                logo: req.body.logo,
                _id: req.params.id 
            }
        );

        if (!errors.isEmpty()) {
            res.render('developer_form', { title: 'Update Developer', developer, errors: errors.array() });
            return;
        } 

        Developer.findByIdAndUpdate(req.params.id, developer, {}, (err, thedeveloper) => {
            if (err) { return next(err) }

            res.redirect(thedeveloper.url);
        });
    }
];