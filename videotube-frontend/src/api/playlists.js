import { api, unwrap } from "./client";

export const createPlaylist = (payload) => unwrap(api.post("/playlists", payload));
export const getUserPlaylists = (userId) => unwrap(api.get(`/playlists/user/${userId}`));
export const getPlaylistById = (playlistId) => unwrap(api.get(`/playlists/${playlistId}`));
export const updatePlaylist = (playlistId, payload) =>
  unwrap(api.patch(`/playlists/${playlistId}`, payload));
export const deletePlaylist = (playlistId) => unwrap(api.delete(`/playlists/${playlistId}`));
export const addVideoToPlaylist = (videoId, playlistId) =>
  unwrap(api.patch(`/playlists/add/${videoId}/${playlistId}`));
export const removeVideoFromPlaylist = (videoId, playlistId) =>
  unwrap(api.patch(`/playlists/remove/${videoId}/${playlistId}`));
