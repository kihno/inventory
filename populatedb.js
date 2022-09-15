#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Genre = require('./models/genre')
var Game = require('./models/game');


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



var genres = []
var games = []


function authorCreate(first_name, family_name, d_birth, d_death, cb) {
  authordetail = {first_name:first_name , family_name: family_name }
  if (d_birth != false) authordetail.date_of_birth = d_birth
  if (d_death != false) authordetail.date_of_death = d_death
  
  var author = new Author(authordetail);
       
  author.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Author: ' + author);
    authors.push(author)
    cb(null, author)
  }  );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  }   );
}

function gameCreate(name, description, price, genre, stock, image, cb) {
    gamedetail = {
        name: name,
        description: description,
        price: price,
        genre: genre,
        stock: stock,
        image: image,
    }

    var game = new Game(gamedetail);
    game.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Game: ' + game);
        games.push(game);
        cb(null, game);
    });
}

function bookCreate(title, summary, isbn, author, genre, cb) {
  bookdetail = { 
    title: title,
    summary: summary,
    author: author,
    isbn: isbn
  }
  if (genre != false) bookdetail.genre = genre
    
  var book = new Book(bookdetail);    
  book.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Book: ' + book);
    books.push(book)
    cb(null, book)
  }  );
}


function bookInstanceCreate(book, imprint, due_back, status, cb) {
  bookinstancedetail = { 
    book: book,
    imprint: imprint
  }    
  if (due_back != false) bookinstancedetail.due_back = due_back
  if (status != false) bookinstancedetail.status = status
    
  var bookinstance = new BookInstance(bookinstancedetail);    
  bookinstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING BookInstance: ' + bookinstance);
      cb(err, null)
      return
    }
    console.log('New BookInstance: ' + bookinstance);
    bookinstances.push(bookinstance)
    cb(null, book)
  }  );
}

function createGenres(cb) {
    async.series([
      function(callback) {
          genreCreate("RPG", callback);
      },
      function(callback) {
          genreCreate("Shooter", callback);
      },
      function(callback) {
          genreCreate("Racing", callback);
      },
      function(callback) {
          genreCreate("Platformer", callback);
      },
      function(callback) {
        genreCreate("Fighting", callback);
      },
      function(callback) {
        genreCreate("Sports", callback);
      },
    ],
    cb);
}

function createGames(cb) {
    async.series([
        function(callback) {
            gameCreate('Super Mario 64', "The first three dimensional entry in the Mario franchise, Super Mario 64 follows Mario as he puts his broadened 3D movement arsenal to use in order to rescue Princess Peach from the clutches of his arch rival Bowser. Mario has to jump into worlds-within-paintings ornamenting the walls of Peach's castle, uncover secrets and hidden challenges and collect golden stars as reward for platforming trials.", 49.99, [genres[3]], 64, './uploads/super-mario-64.png', callback);
        },
        function(callback) {
            gameCreate('The Legend of Zelda: Ocarina of Time', "A 3D reimagining of the core premise of The Legend of Zelda: A Link to the Past (1991), Ocarina of Time follows Link, the protagonist, as he picks up a sword and leaves behind his humble origins in order to trek across the land of Hyrule, venture into its treacherous dungeons and travel through time itself to fulfill his destiny as the Hero of Time by defeating his enemy Ganondorf and ridding Hyrule of evil.", 49.99, [genres[0]], 1, './uploads/legend-of-zelda.png', callback);
        },
        function(callback) {
            gameCreate('GoldenEye 007', "GoldenEye 007 is a first-person shooter video game developed by Rare and based on the 1995 James Bond film GoldenEye. It was exclusively released for the Nintendo 64 video game console in August 1997.", 49.99, [genres[1]], 7, './uploads/goldeneye.png', callback);
        },
        function(callback) {
            gameCreate('Star Fox 64', "The update to the 16-bit Super NES title continues the original's on-rails 3D shooting action on the Nintendo 64. Starring Fox McCloud, Peppy Hare, Falco Lombardi, and Slippy Toad, this new 64-bit version contains 15 plus levels, easy, medium, and difficult paths, forward-scrolling levels as well as full 3D realms, and a three-part multiplayer mode using a four-player split screen. In addition to plenty of Arwing action, the game introduces a new hover tank and even features a submarine level. ", 49.99, [genres[1]], 10, './uploads/starfox.png', callback);
        },
        function(callback) {
            gameCreate('Mario Kart 64', "Mario Kart 64 is the second main installment of the Mario Kart series. It is the first game in the series to use three-dimensional graphics, however, the characters and items in this game are still two-dimensional, pre-rendered sprites. The game offers two camera angles and three engine sizes: 50cc, 100cc and 150cc. Each kart has distinctive handling, acceleration and top speed capabilities. Shells that you fire at rival racers, Bananas that make them skid out and Lightning Bolts that make them small and very slow are just a few of the game's unique power-ups.", 49.99, [genres[2]], 3, './uploads/mario-kart-64.png', callback);
        },
        function(callback) {
            gameCreate('Super Smash Bros.', "Super Smash Bros. is a crossover fighting video game between several different Nintendo franchises, and the first installment in the Super Smash Bros. series. Players must defeat their opponents multiple times in a fighting frenzy of items and power-ups. Super Smash Bros. is a departure from the general genre of fighting games: instead of depleting an opponent's life bar, the players seek to knock opposing characters off a stage. Each player has a damage total, represented by a percentage, which rises as the damage is taken.", 49.99, [genres[4]], 18, './uploads/super-smash-bros.png', callback);
        },
        function(callback) {
            gameCreate('NFL Blitz', "NFL Blitz takes the idea of a normal football video game and turns it on its head with fewer players, bigger hits, and lots of personality.", 49.99, [genres[5]], 324, './uploads/nfl-blitz.png', callback);
        },
        function(callback) {
            gameCreate('F-Zero X', "It's you against 29 other machines competing for the title of F-Zero X Champion. You're racing at speeds of over 1,000 km/h high above the atmosphere. Your competition comes from every corner of the galaxy and won't shed a tear at the thought of smashing you off the track. With four-player simultaneous gameplay and the Rumble Pak accessory, you have the fastest racing game on the N64 system!", 49.99, [genres[2]], 12, './uploads/f-zero.png', callback);
        },
        function(callback) {
            gameCreate('Turok: Dinosaur Hunter', "A world where time has no meaning - and evil knows no bounds. Torn from a world long gone, the time traveling warrior Turok has found himself thrust into a savage land torn by conflict.", 49.99, [genres[1]], 0, './uploads/turok.png', callback);
        },
        function(callback) {
            gameCreate('Star Wars: Shadows of the Empire', "As Luke Skywalker and the Rebel Alliance struggle to defeat Darth Vader and the Empire, a new threat arises. Dark Prince Xizor aspires to take Darth Vader's place at the Emperor's side. As Dash Rendar, it's up to you to protect Luke and help the Alliance. May the Force be with you!", 49.99, [genres[1], genres[3]], 9, './uploads/shadows-of-the-empire.png', callback);
        },
        function(callback) {
            gameCreate('Doom 64', "You killed the Demons once, they were all dead. Or so you thought... A single Demon Entity escaped detection. Systematically it altered decaying, dead carnage back into grotesque living tissue. The Demons have returned - stronger and more vicious than ever before. You mission is clear, there are no options: kill or be killed!", 49.99, [genres[1]], 666, './uploads/doom-64.png', callback);
        },
        function(callback) {
            gameCreate("Tom Clancy's Rainbow Six", "The most revolutionary action/strategy game of its kind. Nothing comes closer to offering an exciting combination of strategy, team-building, realistic three-dimensional graphics and true-to-life special forces action. The ultimate goal is to save yourself and the world from deadly terrorists. You must successfully complete 17 unique missions. If you die, the game isn't over. The World is.", 49.99, [genres[1]], 6, './uploads/rainbow-six.png', callback);
        },
    ],
    cb);
}


async.series([
    createGenres,
    createGames
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Games: '+games);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});