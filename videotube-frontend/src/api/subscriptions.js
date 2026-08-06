import { api, unwrap } from "./client";

export const toggleSubscription = (channelId) =>
  unwrap(api.post(`/subscriptions/c/${channelId}`));

export const getChannelSubscribers = (channelId) =>
  unwrap(api.get(`/subscriptions/c/${channelId}/subscribers`));

export const getSubscribedChannels = (subscriberId) =>
  unwrap(api.get(`/subscriptions/u/${subscriberId}/channels`));
