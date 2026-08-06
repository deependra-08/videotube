import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../api/tweets";
import { timeAgo } from "../utils/format";
import Loader from "./Loader";

export default function TweetFeed({ channelId, isOwner }) {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    if (!channelId) return;
    setIsLoading(true);
    getUserTweets(channelId)
      .then(setTweets)
      .finally(() => setIsLoading(false));
  }, [channelId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const tweet = await createTweet(draft.trim());
    setTweets((prev) => [{ ...tweet, owner: user }, ...prev]);
    setDraft("");
  };

  const handleDelete = async (id) => {
    await deleteTweet(id);
    setTweets((prev) => prev.filter((t) => t._id !== id));
  };

  const handleSaveEdit = async (id) => {
    const updated = await updateTweet(id, editDraft.trim());
    setTweets((prev) => prev.map((t) => (t._id === id ? { ...t, content: updated.content } : t)));
    setEditingId(null);
  };

  if (isLoading) return <Loader label="Loading posts" />;

  return (
    <div className="max-w-xl">
      {isOwner && (
        <form onSubmit={handlePost} className="mb-6 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share something with your subscribers…"
            rows={2}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
          />
          <button
            type="submit"
            className="self-end rounded-full bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-bg)"
          >
            Post
          </button>
        </form>
      )}

      {!tweets.length ? (
        <p className="text-sm text-(--color-muted)">No posts yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {tweets.map((tweet) => (
            <div key={tweet._id} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-(--color-muted)">{timeAgo(tweet.createdAt)}</p>
                {isOwner && (
                  <div className="flex gap-2 text-xs text-(--color-muted)">
                    <button
                      onClick={() => {
                        setEditingId(tweet._id);
                        setEditDraft(tweet.content);
                      }}
                      className="hover:text-(--color-ink)"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(tweet._id)} className="hover:text-(--color-danger)">
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {editingId === tweet._id ? (
                <div className="mt-2 flex flex-col gap-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm focus:border-(--color-accent) focus:outline-none"
                  />
                  <div className="flex gap-2 self-end text-sm">
                    <button onClick={() => setEditingId(null)} className="text-(--color-muted)">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(tweet._id)}
                      className="rounded-full bg-(--color-accent) px-3 py-1 text-(--color-bg)"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-sm">{tweet.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
