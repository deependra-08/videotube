import { api, unwrap } from "./client";

export const toggleVideoLike = (videoId) => unwrap(api.post(`/likes/toggle/v/${videoId}`));
export const toggleCommentLike = (commentId) => unwrap(api.post(`/likes/toggle/c/${commentId}`));
export const toggleTweetLike = (tweetId) => unwrap(api.post(`/likes/toggle/t/${tweetId}`));
export const getLikedVideos = () => unwrap(api.get("/likes/videos"));
