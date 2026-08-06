import { api, unwrap } from "./client";

export const getVideoComments = (videoId, page = 1) =>
  unwrap(api.get(`/comments/${videoId}`, { params: { page, limit: 20 } }));

export const addComment = (videoId, content) =>
  unwrap(api.post(`/comments/${videoId}`, { content }));

export const updateComment = (commentId, content) =>
  unwrap(api.patch(`/comments/c/${commentId}`, { content }));

export const deleteComment = (commentId) =>
  unwrap(api.delete(`/comments/c/${commentId}`));
