const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DeveloperSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        country: {type: String, required: true, maxLength: 56},
        image: {type: String}
    }
);

DeveloperSchema.virtual('url').get(function () {
    return `/catalog/developer/${this._id}`;
});

module.exports = mongoose.model('Developer', DeveloperSchema);