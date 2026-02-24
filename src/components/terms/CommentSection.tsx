"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Comment } from "./types";
import { createComment } from "@/services/termService";
import {
  Send,
  MessageCircle,
  User as UserIcon,
  Clock,
  Reply,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./CommentSection.scss";

interface CommentSectionProps {
  termId: string;
  comments: Comment[];
  loading: boolean;
  onCommentAdded: (comment: Comment) => void;
}

export default function CommentSection({
  termId,
  comments,
  loading,
  onCommentAdded,
}: CommentSectionProps) {
  const t = useTranslations("term");
  const tComment = useTranslations("comment");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { user, isAuthenticated } = useAuth();

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return tComment("justNow");
    if (diffMins < 60) return tComment("minutesAgo", { count: diffMins });
    if (diffHours < 24) return tComment("hoursAgo", { count: diffHours });
    if (diffDays < 7) return tComment("daysAgo", { count: diffDays });

    return date.toLocaleDateString(locale);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error(tComment("loginToComment"));
      return;
    }

    if (!newComment.trim()) {
      toast.error(tComment("emptyComment"));
      return;
    }

    setSubmitting(true);
    try {
      const comment = await createComment(termId, newComment.trim());
      if (comment) {
        onCommentAdded(comment);
        setNewComment("");
        toast.success(tComment("pending"));
      }
    } catch (error) {
      toast.error(tComment("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!isAuthenticated) {
      toast.error(tComment("loginToReply"));
      return;
    }

    if (!replyContent.trim()) {
      toast.error(tComment("emptyReply"));
      return;
    }

    setSubmitting(true);
    try {
      const comment = await createComment(
        termId,
        replyContent.trim(),
        parentId,
      );
      if (comment) {
        onCommentAdded(comment);
        setReplyContent("");
        setReplyingTo(null);
        toast.success(tComment("replyPending"));
      }
    } catch (error) {
      toast.error(tComment("replyError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Render single comment
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment._id}
      className={`comment ${isReply ? "comment--reply" : ""}`}
    >
      <div className="comment__avatar">
        <UserIcon size={isReply ? 20 : 24} />
      </div>

      <div className="comment__content">
        <div className="comment__header">
          <span className="comment__author">{comment.author.fullName}</span>
          <span className="comment__time">
            <Clock size={12} />
            {formatDate(comment.createdAt)}
          </span>
          {comment.status === "pending" && (
            <span className="comment__status comment__status--pending">
              Đang chờ duyệt
            </span>
          )}
        </div>

        <p className="comment__text">{comment.content}</p>

        {isAuthenticated && !isReply && (
          <button
            className="comment__reply-btn"
            onClick={() =>
              setReplyingTo(replyingTo === comment._id ? null : comment._id)
            }
          >
            <Reply size={14} />
            {tComment("reply")}
          </button>
        )}

        {/* Reply form */}
        {replyingTo === comment._id && (
          <div className="comment__reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={tComment("replyPlaceholder")}
              rows={2}
              className="reply-input"
            />
            <div className="reply-actions">
              <button
                className="btn btn--cancel"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                {tCommon("cancel")}
              </button>
              <button
                className="btn btn--submit"
                onClick={() => handleSubmitReply(comment._id)}
                disabled={submitting || !replyContent.trim()}
              >
                {submitting ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Send size={14} />
                )}
                {tComment("send")}
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment__replies">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="comment-section">
      {/* Comment Form */}
      {isAuthenticated ? (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="comment-form__avatar">
            <UserIcon size={24} />
          </div>
          <div className="comment-form__input-wrapper">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={tComment("placeholder")}
              rows={3}
              className="comment-form__input"
              disabled={submitting}
            />
            <button
              type="submit"
              className="comment-form__submit"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <Send size={18} />
              )}
              <span>{tComment("send")}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-section__login-prompt">
          <MessageCircle size={24} />
          <p>
            <a href="/login">{tComment("loginLink")}</a>{" "}
            {tComment("loginPrompt")}
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="comment-list">
        {loading ? (
          <div className="comment-list__loading">
            <Loader2 size={24} className="spin" />
            <span>{tComment("loading")}</span>
          </div>
        ) : comments.length > 0 ? (
          comments
            .filter((c) => !c.parentComment) // Only top-level comments
            .map((comment) => renderComment(comment))
        ) : (
          <div className="comment-list__empty">
            <MessageCircle size={32} />
            <p>{tComment("noComments")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
