import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createTweet);

router.get("/user/:userId", getUserTweets);

router
    .route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default router;