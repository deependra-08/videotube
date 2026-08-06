import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addComment, deleteComment, getVideoComments, updateComment } from "../api/comments";
import { timeAgo, apiErrorMessage } from "../utils/format";
import Loader from "./Loader";

function CommentRow({ comment, currentUserId, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const isOwner = comment.owner?._id === currentUserId;

  const save = async () => {
    if (!draft.trim()) return;
    await onUpdate(comment._id, draft.trim());
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3 py-4">
      {comment.owner?.avatar && (
        <img src={comment.owner.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{comment.owner?.username}</span>
          <span className="text-xs text-(--color-muted)">{timeAgo(comment.createdAt)}</span>
        </div>
        {isEditing ? (
          <div className="mt-1 flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus:border-(--color-accent) focus:outline-none"
            />
            <div className="flex gap-2 text-sm">
              <button onClick={save} className="rounded-full bg-(--color-accent) px-3 py-1 text-(--color-bg)">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="text-(--color-muted)">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-(--color-ink)">{comment.content}</p>
        )}
        {isOwner && !isEditing && (
          <div className="mt-1 flex gap-3 text-xs text-(--color-muted)">
            <button onClick={() => setIsEditing(true)} className="hover:text-(--color-ink)">
              Edit
            </button>
            <button onClick={() => onDelete(comment._id)} className="hover:text-(--color-danger)">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getVideoComments(videoId);
      setComments(data.comments || []);
      setTotal(data.totalComments || 0);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const created = await addComment(videoId, draft.trim());
    setComments((prev) => [created, ...prev]);
    setTotal((t) => t + 1);
    setDraft("");
  };

  const handleDelete = async (commentId) => {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setTotal((t) => t - 1);
  };

  const handleUpdate = async (commentId, content) => {
    const updated = await updateComment(commentId, content);
    setComments((prev) => prev.map((c) => (c._id === commentId ? updated : c)));
  };

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-base font-medium">{total} Comments</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
          <img src={user.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          <div className="flex-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment…"
              className="w-full border-b border-(--color-border) bg-transparent px-1 py-2 text-sm focus:border-(--color-accent) focus:outline-none"
            />
            {draft.trim() && (
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDraft("")}
                  className="rounded-full px-3 py-1.5 text-sm text-(--color-muted)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-(--color-accent) px-3 py-1.5 text-sm text-(--color-bg)"
                >
                  Comment
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-(--color-muted)">Sign in to leave a comment.</p>
      )}

      {isLoading ? (
        <Loader label="Loading comments" />
      ) : error ? (
        <p className="text-sm text-(--color-danger)">{error}</p>
      ) : (
        <div className="divide-y divide-(--color-border)">
          {comments.map((comment) => (
            <CommentRow
              key={comment._id}
              comment={comment}
              currentUserId={user?._id}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
