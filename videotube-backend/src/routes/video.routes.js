import { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controllers.js";
import { verifyJWT, verifyJWTOptional } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.get("/", getAllVideos);

router.get("/:videoId", verifyJWTOptional, getVideoById);

router.post(
    "/",
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo
);

// Update a video
router.patch(
    "/:videoId",
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
);

// Delete a video
router.delete(
    "/:videoId",
    verifyJWT,
    deleteVideo
);
router.patch(
    "/toggle/publish/:videoId",
    verifyJWT,
    togglePublishStatus
);

export default router;