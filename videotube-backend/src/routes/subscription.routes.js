import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Subscribe / Unsubscribe
router.route("/c/:channelId")
    .post(toggleSubscription);

// Get subscribers of a channel
router.route("/c/:channelId/subscribers")
    .get(getUserChannelSubscribers);

// Get channels subscribed by a user
router.route("/u/:subscriberId/channels")
    .get(getSubscribedChannels);

export default router;