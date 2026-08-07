import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all published videos
const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId,
        videoType, // "short" | "video" | undefined (= both)
    } = req.query;

    const pipeline = [];

    pipeline.push({
        $match: {
            isPublished: true,
        },
    });

    if (videoType === "short") {
        pipeline.push({ $match: { isShort: true } });
    } else if (videoType === "video") {
        pipeline.push({ $match: { isShort: { $ne: true } } });
    }

    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    {
                        title: {
                            $regex: query,
                            $options: "i",
                        },
                    },
                    {
                        description: {
                            $regex: query,
                            $options: "i",
                        },
                    },
                ],
            },
        });
    }

    if (userId && isValidObjectId(userId)) {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        });
    }

    pipeline.push({
        $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1,
        },
    });

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
            },
        }
    );

    const options = {
        page: Number(page),
        limit: Number(limit),
    };

    const videos = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        options
    );

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

// Get a batch of shorts for the swipeable shorts feed.
// Returns a random selection so repeat visits don't always show the same
// order, while `exclude` lets the frontend avoid re-serving shorts already
// seen in the current session as the viewer keeps swiping.
const getShorts = asyncHandler(async (req, res) => {
    const { limit = 10, exclude = "" } = req.query;

    const excludeIds = exclude
        .split(",")
        .filter((id) => isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));

    const pipeline = [
        {
            $match: {
                isPublished: true,
                isShort: true,
                ...(excludeIds.length ? { _id: { $nin: excludeIds } } : {}),
            },
        },
        { $sample: { size: Number(limit) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { fullname: 1, username: 1, avatar: 1 } },
                ],
            },
        },
        { $addFields: { owner: { $first: "$owner" } } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        { $addFields: { likesCount: { $size: "$likes" } } },
        { $project: { likes: 0 } },
    ];

    const shorts = await Video.aggregate(pipeline);

    return res
        .status(200)
        .json(new ApiResponse(200, shorts, "Shorts fetched successfully"));
});

// Get single video
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId).populate(
        "owner",
        "fullname username avatar"
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.views += 1;
    await video.save({ validateBeforeSave: false });

    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { watchHistory: video._id },
        });
    }

    const likesCount = await Like.countDocuments({ video: video._id });
    const isLiked = req.user?._id
        ? !!(await Like.findOne({ video: video._id, likedBy: req.user._id }))
        : false;

    const videoResponse = {
        ...video.toObject(),
        likesCount,
        isLiked,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, videoResponse, "Video fetched successfully"));
});

// Publish video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isShort } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!uploadedVideo || !uploadedThumbnail) {
        throw new ApiError(500, "File upload failed");
    }

    const duration = uploadedVideo.duration || 0;
    // Respect an explicit choice from the uploader; otherwise fall back to
    // a reasonable heuristic (Shorts are typically <= 60s).
    const resolvedIsShort =
        isShort !== undefined ? isShort === "true" || isShort === true : duration > 0 && duration <= 60;

    const video = await Video.create({
        title,
        description,
        videoFile: uploadedVideo.secure_url,
        thumbnail: uploadedThumbnail.secure_url,
        duration,
        isShort: resolvedIsShort,
        owner: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

// Update video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    if (title) video.title = title;
    if (description) video.description = description;

    const thumbnailPath = req.file?.path;

    if (thumbnailPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailPath);
        video.thumbnail = thumbnail.secure_url;
    }

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"));
});

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// Toggle publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    video.isPublished = !video.isPublished;

    await video.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            `Video ${
                video.isPublished ? "published" : "unpublished"
            } successfully`
        )
    );
});

export {
    getAllVideos,
    getShorts,
    getVideoById,
    publishAVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};