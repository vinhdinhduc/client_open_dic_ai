"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import "./Pagination.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

function getPageNumbers(
  current: number,
  total: number,
  siblings: number,
): (number | "...")[] {
  const totalNumbers = siblings * 2 + 5; // siblings + boundaries + current + 2 ellipses
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);

  const showLeftDots = leftSibling > 3;
  const showRightDots = rightSibling < total - 2;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + 2 * siblings }, (_, i) => i + 1);
    return [...leftRange, "...", total];
  }
  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from(
      { length: 3 + 2 * siblings },
      (_, i) => total - (3 + 2 * siblings) + i + 1,
    );
    return [1, "...", ...rightRange];
  }
  return [
    1,
    "...",
    ...Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i,
    ),
    "...",
    total,
  ];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages, siblingCount);

  return (
    <nav className="pagination-bar" aria-label="Pagination">
      <button
        className="pagination-bar__btn pagination-bar__btn--nav"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="First page"
      >
        <ChevronsLeft size={16} />
      </button>
      <button
        className="pagination-bar__btn pagination-bar__btn--nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="pagination-bar__pages">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="pagination-bar__dots">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`pagination-bar__btn pagination-bar__btn--page ${p === currentPage ? "pagination-bar__btn--active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        className="pagination-bar__btn pagination-bar__btn--nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
      <button
        className="pagination-bar__btn pagination-bar__btn--nav"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        <ChevronsRight size={16} />
      </button>
    </nav>
  );
}
