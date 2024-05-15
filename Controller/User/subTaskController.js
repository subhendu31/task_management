const mongoose = require("mongoose");
const subTaskModel = require("../../Models/subTaskModel");
const ResponseCode = require("../../Service/response");
const { DBerror } = require("../../Service/errorHandeler");
const multer = require('multer');
let upload = require('../../middleware/imageUpload');

const addSubTask = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(ResponseCode.errorCode.serverError).json({
                    status: false,
                    message: "Error uploading images",
                    error: err
                });
            } else if (err) {
                return res.status(ResponseCode.errorCode.serverError).json({
                    status: false,
                    message: "Unknown error uploading images",
                    error: err
                });
            }

            const existTask = await subTaskModel.find({
                title: { $regex: new RegExp(req.body.title, 'i') },
                isDeleted: false,
            });

            if (existTask.length > 0) {
                return res.status(ResponseCode.errorCode.dataExist).json({
                    status: false,
                    message: "Sub Task already exists",
                });
            }
            console.log("body dataa", req.body);
            const data = {
                ...req.body,
                addedBy: req.user._id,
                createdOn: new Date()
            };

            // data.attachment = req.files.map(file => ({
            //     filename: file.filename,
            // }));

            data.attachment = req.files.map(file => `/images/${file.filename}`);

            // console.log("data is",data);

            const savedData = await new subTaskModel(data).save();
            return res.status(ResponseCode.errorCode.success).json({
                status: true,
                message: "Sub Task added successfully",
                data: savedData
            });
        });
    } catch (error) {
        console.log("error is", error);
        const errors = DBerror(error);
        return res.status(ResponseCode.errorCode.serverError).json({
            status: false,
            message: "Server error, please try again",
            error: errors,
        });
    }
};



const viewSubTask = async (req, res) => {
    await subTaskModel
        .aggregate([
            {
                $match: {
                    isDeleted: false,
                },
            },
            {
                $lookup: {
                    from: 'tasks',
                    localField: 'taskId',
                    foreignField: '_id',
                    as: 'taskDetails',
                }
            },
            {
                $unwind: {
                    path: "$taskDetails", preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    taskName: "$taskDetails.title"
                }
            },
            {
                $project: {
                    taskDetails: 0,
                    createdOn: 0,
                    updatedOn: 0,
                    isDeleted: 0,
                    __v: 0,
                },
            },
            {
                $sort: {
                    _id: -1,
                    // createdOn: -1,
                },
            },
        ])
        .then((data) => {
            return res.status(ResponseCode.errorCode.success).json({
                status: true,
                message: "Sub Task data fetched successfully",
                data: data,
            });
        })
        .catch((error) => {
            const errors = DBerror(error);
            return res.status(ResponseCode.errorCode.serverError).json({
                status: false,
                message: "Server error,Please try again",
                error: errors,
            });
        });
};

const getSubtaskByTaskId = async (req, res) => {

    // Check if req.params.id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(ResponseCode.errorCode.badRequest).json({
            status: false,
            message: "Invalid ID",
        });
    }
    const existingData = await subTaskModel.findOne({
        taskId: new mongoose.Types.ObjectId(req.params.id),
        isDeleted: false,
    });

    if (!existingData) {
        return res.status(ResponseCode.errorCode.notFound).json({
            status: false,
            message: "Provided ID not found",
        });
    }

    await subTaskModel
        .aggregate([
            {
                $match: {
                    isDeleted: false,
                    taskId: new mongoose.Types.ObjectId(req.params.id)
                },
            },
            {
                $lookup:{
                    from: 'tasks',
                    localField: 'taskId',
                    foreignField: '_id',
                    as: 'taskDetails',
                }
            },
            {
                $unwind: {
                    path: "$taskDetails", preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    taskName: "$taskDetails.title"
                }
            },
            {
                $project: {
                    createdOn: 0,
                    taskDetails: 0,
                    updatedOn: 0,
                    isDeleted: 0,
                    __v: 0,
                },
            },
            {
                $sort: {
                    _id: -1,
                    // createdOn: -1,
                },
            },
        ])
        .then((data) => {
            return res.status(ResponseCode.errorCode.success).json({
                status: true,
                message: "Sub Task data fetched successfully",
                data: data,
            });
        })
        .catch((error) => {
            const errors = DBerror(error);
            return res.status(ResponseCode.errorCode.serverError).json({
                status: false,
                message: "Server error,Please try again",
                error: errors,
            });
        });
};

const editSubTask = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(ResponseCode.errorCode.serverError).json({
                    status: false,
                    message: "Error uploading images",
                    error: err
                });
            } else if (err) {
                return res.status(ResponseCode.errorCode.serverError).json({
                    status: false,
                    message: "Unknown error uploading images",
                    error: err
                });
            }

            // Check if req.params.id is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(ResponseCode.errorCode.badRequest).json({
                    status: false,
                    message: "Invalid ID",
                });
            }
            const existingData = await subTaskModel.findOne({
                _id: new mongoose.Types.ObjectId(req.params.id),
                isDeleted: false,
            });

            if (!existingData) {
                return res.status(ResponseCode.errorCode.notFound).json({
                    status: false,
                    message: "Provided ID not found",
                });
            }

            const existTask = await subTaskModel.find({
                _id: { $ne: req.params.id },
                title: { $regex: new RegExp(req.body.title, 'i') },
                isDeleted: false,
            });
            if (existTask.length > 0) {
                return res.status(ResponseCode.errorCode.dataExist).json({
                    status: false,
                    message: "Sub Task name already exists",
                });
            }

            const updatedData = {
                ...req.body,
                updatedOn: new Date()
            };

            updatedData.attachment = req.files.map(file => `/images/${file.filename}`);

            const newData = await subTaskModel.findOneAndUpdate(
                {
                    _id: new mongoose.Types.ObjectId(req.params.id),
                },
                updatedData,
                { new: true }
            );

            return res.status(ResponseCode.errorCode.success).json({
                status: true,
                message: "Sub Task updated successfully",
                data: newData
            });
        });
    } catch (error) {
        const errors = DBerror(error);
        return res.status(ResponseCode.errorCode.serverError).json({
            status: false,
            message: "Server error, Please try again",
            error: errors,
        });
    }
};

const deleteSubTask = async (req, res) => {
    // Check if req.params.id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(ResponseCode.errorCode.badRequest).json({
            status: false,
            message: "Invalid  ID",
        });
    }
    const existingData = await subTaskModel.findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
        isDeleted: false,
    });

    if (!existingData) {
        return res.status(ResponseCode.errorCode.notFound).json({
            status: false,
            message: " provided ID not found",
        });
    }
    await subTaskModel
        .findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
            },
            {
                isDeleted: true,
            }
        )
        .then((data) => {
            return res.status(ResponseCode.errorCode.success).json({
                status: true,
                message: "Sub Task deleted successfully",
            });
        })
        .catch((error) => {
            const errors = DBerror(error);
            return res.status(ResponseCode.errorCode.serverError).json({
                status: false,
                message: "Server error,Please try again",
                error: errors,
            });
        });
};

module.exports = {
    addSubTask,
    viewSubTask,
    editSubTask,
    deleteSubTask,
    getSubtaskByTaskId
};
