const Genre = require('../models/genre');

exports.genre_list = (req, res) => {
    Genre.find({}, )
    .sort({ name:1 })
    .populate()
    .exec(function (err, list_genres) {
        if (err) { return next(err) }

        res.render('genre_list', { title: "Genres", genre_list: list_genres});
    });
};

exports.genre_detail = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre Detail');
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