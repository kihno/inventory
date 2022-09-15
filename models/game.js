const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameSchema = new Schema(
    {
        name: { type: String, required: true, maxLength: 100 },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        genre: [{ type: Schema.Types.ObjectId, ref: 'Genre'}],
        stock: { type: Number },
        image: { type: String }
    }
);

GameSchema.virtual('url').get(function () {
    return `/catalog/game/${this._id}`;
});

module.exports = mongoose.model('Game', GameSchema);