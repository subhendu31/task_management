
var mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    attachment: {
        type: Array,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    taskId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId
    },
    addedBy: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdOn: {
        type: Date,
        default: new Date(),
    },
    updatedOn: {
        type: Date,
        default: new Date(),
    },
});

module.exports = mongoose.model("subtask", taskSchema);
