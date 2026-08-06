import { api, unwrap } from "./client";

export const createTweet = (content) => unwrap(api.post("/tweets", { content }));
export const getUserTweets = (userId) => unwrap(api.get(`/tweets/user/${userId}`));
export const updateTweet = (tweetId, content) =>
  unwrap(api.patch(`/tweets/${tweetId}`, { content }));
export const deleteTweet = (tweetId) => unwrap(api.delete(`/tweets/${tweetId}`));
