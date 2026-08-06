import { api, unwrap } from "./client";

export const getAllVideos = (params) => unwrap(api.get("/videos", { params }));

export const getVideoById = (videoId) => unwrap(api.get(`/videos/${videoId}`));

export const publishVideo = (formData) =>
  unwrap(
    api.post("/videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

export const updateVideo = (videoId, formData) =>
  unwrap(
    api.patch(`/videos/${videoId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

export const deleteVideo = (videoId) => unwrap(api.delete(`/videos/${videoId}`));

export const togglePublishStatus = (videoId) =>
  unwrap(api.patch(`/videos/toggle/publish/${videoId}`));
