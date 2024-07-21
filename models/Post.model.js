const mongoose = require('mongoose');
const { schema, model } = mongoose;

const postSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    picPath: {
        type: String
    },
    picName: {
        type: String
    }
},{
    timestamps: true
});

module.exports = model('Post',postSchema);