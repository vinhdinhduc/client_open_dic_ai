"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  FolderTree,
  Grid3X3,
  List,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";

// Types
interface Category {
  _id: string;
  name: {
    vi: string;
    en?: string;
    lo?: string;
  };
  description?: {
    vi?: string;
    en?: string;
  };
  icon?: string;
  parent?: string;
  order: number;
  termCount: number;
  isActive: boolean;
  createdAt: string;
}

// Mock data
const mockCategories: Category[] = [
  {
    _id: "1",
    name: {
      vi: "Công nghệ thông tin",
      en: "Information Technology",
      lo: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    },
    description: {
      vi: "Các thuật ngữ liên quan đến máy tính, phần mềm, mạng và công nghệ số",
      en: "Terms related to computers, software, networks and digital technology",
    },
    icon: "💻",
    order: 1,
    termCount: 234,
    isActive: true,
    createdAt: "2025-01-15",
  },
  {
    _id: "2",
    name: { vi: "Kinh tế - Tài chính", en: "Economics - Finance" },
    description: {
      vi: "Thuật ngữ về kinh tế học, tài chính, ngân hàng và đầu tư",
    },
    icon: "📈",
    order: 2,
    termCount: 189,
    isActive: true,
    createdAt: "2025-01-16",
  },
  {
    _id: "3",
    name: { vi: "Y học - Sức khỏe", en: "Medicine - Health" },
    description: { vi: "Thuật ngữ y khoa, chăm sóc sức khỏe và dược phẩm" },
    icon: "🏥",
    order: 3,
    termCount: 156,
    isActive: true,
    createdAt: "2025-01-17",
  },
  {
    _id: "4",
    name: { vi: "Nông nghiệp", en: "Agriculture" },
    description: { vi: "Thuật ngữ về trồng trọt, chăn nuôi, thủy sản" },
    icon: "🌾",
    order: 4,
    termCount: 98,
    isActive: true,
    createdAt: "2025-01-18",
  },
  {
    _id: "5",
    name: { vi: "Luật - Pháp lý", en: "Law - Legal" },
    description: { vi: "Thuật ngữ pháp luật, tư pháp và hành chính" },
    icon: "⚖️",
    order: 5,
    termCount: 145,
    isActive: true,
    createdAt: "2025-01-19",
  },
  {
    _id: "6",
    name: { vi: "Sinh học", en: "Biology" },
    description: { vi: "Thuật ngữ về sinh học, di truyền, sinh thái" },
    icon: "🧬",
    order: 6,
    termCount: 112,
    isActive: false,
    createdAt: "2025-01-20",
  },
];

const emojiList = [
  "💻",
  "📈",
  "🏥",
  "🌾",
  "⚖️",
  "🧬",
  "🔬",
  "📚",
  "🎓",
  "🌍",
  "🔧",
  "🎨",
  "🎵",
  "🏛️",
  "✈️",
  "🏠",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: { vi: "", en: "", lo: "" },
    description: { vi: "", en: "" },
    icon: "💻",
    isActive: true,
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Filter categories
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.name.en &&
        cat.name.en.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalTerms = categories.reduce((sum, cat) => sum + cat.termCount, 0);

  const resetForm = () => {
    setFormData({
      name: { vi: "", en: "", lo: "" },
      description: { vi: "", en: "" },
      icon: "💻",
      isActive: true,
    });
  };

  const handleCreate = () => {
    const newCategory: Category = {
      _id: Date.now().toString(),
      ...formData,
      order: categories.length + 1,
      termCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCategories([...categories, newCategory]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (selectedCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === selectedCategory._id ? { ...cat, ...formData } : cat,
        ),
      );
      setShowEditModal(false);
      setSelectedCategory(null);
      resetForm();
    }
  };

  const handleDelete = () => {
    if (selectedCategory) {
      setCategories((prev) =>
        prev.filter((cat) => cat._id !== selectedCategory._id),
      );
      setShowDeleteConfirm(false);
      setSelectedCategory(null);
    }
  };

  const handleToggleActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat._id === categoryId ? { ...cat, isActive: !cat.isActive } : cat,
      ),
    );
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: {
        vi: category.name.vi,
        en: category.name.en || "",
        lo: category.name.lo || "",
      },
      description: {
        vi: category.description?.vi || "",
        en: category.description?.en || "",
      },
      icon: category.icon || "💻",
      isActive: category.isActive,
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang tải danh sách danh mục...</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Quản lý danh mục</h1>
          <p className="admin-page-header__subtitle">
            Tổ chức và quản lý các danh mục thuật ngữ
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button
            className="admin-btn admin-btn--primary"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="category-stats">
        <div className="category-stat">
          <div className="category-stat__icon">
            <FolderTree size={24} />
          </div>
          <div className="category-stat__content">
            <span className="category-stat__value">{categories.length}</span>
            <span className="category-stat__label">Tổng danh mục</span>
          </div>
        </div>
        <div className="category-stat">
          <div className="category-stat__icon category-stat__icon--success">
            <BookOpen size={24} />
          </div>
          <div className="category-stat__content">
            <span className="category-stat__value">{totalTerms}</span>
            <span className="category-stat__label">Tổng thuật ngữ</span>
          </div>
        </div>
        <div className="category-stat">
          <div className="category-stat__icon category-stat__icon--warning">
            <Grid3X3 size={24} />
          </div>
          <div className="category-stat__content">
            <span className="category-stat__value">
              {categories.filter((c) => c.isActive).length}
            </span>
            <span className="category-stat__label">Đang hoạt động</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        {/* Toolbar */}
        <div className="category-toolbar">
          <div className="admin-filters__search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button
              className={`view-toggle__btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              className={`view-toggle__btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="category-grid">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className={`category-card ${!category.isActive ? "category-card--inactive" : ""}`}
              >
                <div className="category-card__header">
                  <span className="category-card__icon">{category.icon}</span>
                  <div className="category-card__actions">
                    <button
                      className="action-btn"
                      onClick={() => openEditModal(category)}
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn action-btn--danger"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowDeleteConfirm(true);
                      }}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="category-card__content">
                  <h3 className="category-card__name">{category.name.vi}</h3>
                  {category.name.en && (
                    <p className="category-card__name-en">{category.name.en}</p>
                  )}
                  {category.description?.vi && (
                    <p className="category-card__desc">
                      {category.description.vi}
                    </p>
                  )}
                </div>
                <div className="category-card__footer">
                  <span className="category-card__count">
                    <BookOpen size={14} />
                    {category.termCount} thuật ngữ
                  </span>
                  <button
                    className={`status-toggle ${category.isActive ? "active" : ""}`}
                    onClick={() => handleToggleActive(category._id)}
                  >
                    <span className="status-toggle__dot"></span>
                    <span>{category.isActive ? "Hoạt động" : "Ẩn"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="category-list">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className={`category-list-item ${!category.isActive ? "category-list-item--inactive" : ""}`}
              >
                <div className="category-list-item__main">
                  <div className="category-list-item__drag">
                    <GripVertical size={18} />
                  </div>
                  <span className="category-list-item__icon">
                    {category.icon}
                  </span>
                  <div className="category-list-item__info">
                    <h4>{category.name.vi}</h4>
                    {category.name.en && <span>{category.name.en}</span>}
                  </div>
                  <span className="category-list-item__count">
                    {category.termCount} thuật ngữ
                  </span>
                  <button
                    className={`status-toggle ${category.isActive ? "active" : ""}`}
                    onClick={() => handleToggleActive(category._id)}
                  >
                    <span className="status-toggle__dot"></span>
                    <span>{category.isActive ? "Hoạt động" : "Ẩn"}</span>
                  </button>
                  <div className="category-list-item__actions">
                    <button
                      className="action-btn"
                      onClick={() => openEditModal(category)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn action-btn--danger"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() =>
                        setExpandedCard(
                          expandedCard === category._id ? null : category._id,
                        )
                      }
                    >
                      {expandedCard === category._id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>
                {expandedCard === category._id && (
                  <div className="category-list-item__expanded">
                    <p>{category.description?.vi || "Chưa có mô tả"}</p>
                    <div className="expanded-meta">
                      <span>Thứ tự: {category.order}</span>
                      <span>
                        Ngày tạo:{" "}
                        {new Date(category.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="admin-empty">
            <FolderTree size={48} />
            <h3>Không tìm thấy danh mục</h3>
            <p>Thử thay đổi từ khóa tìm kiếm hoặc thêm danh mục mới</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
          }}
        >
          <div className="modal modal--md" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>
                {showCreateModal ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
              </h2>
              <button
                className="modal__close"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <div className="admin-form">
                {/* Icon Picker */}
                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-picker">
                    {emojiList.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`icon-picker__item ${formData.icon === emoji ? "active" : ""}`}
                        onClick={() =>
                          setFormData({ ...formData, icon: emoji })
                        }
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vietnamese Name */}
                <div className="form-group">
                  <label>
                    Tên danh mục (Tiếng Việt){" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name.vi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { ...formData.name, vi: e.target.value },
                      })
                    }
                    placeholder="Nhập tên danh mục"
                  />
                </div>

                {/* English Name */}
                <div className="form-group">
                  <label>Tên danh mục (English)</label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { ...formData.name, en: e.target.value },
                      })
                    }
                    placeholder="Enter category name"
                  />
                </div>

                {/* Lao Name */}
                <div className="form-group">
                  <label>Tên danh mục (ພາສາລາວ)</label>
                  <input
                    type="text"
                    value={formData.name.lo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { ...formData.name, lo: e.target.value },
                      })
                    }
                    placeholder="ປ້ອນຊື່ໝວດໝູ່"
                  />
                </div>

                {/* Vietnamese Description */}
                <div className="form-group">
                  <label>Mô tả (Tiếng Việt)</label>
                  <textarea
                    value={formData.description.vi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: {
                          ...formData.description,
                          vi: e.target.value,
                        },
                      })
                    }
                    placeholder="Nhập mô tả danh mục"
                    rows={3}
                  />
                </div>

                {/* Active Toggle */}
                <div className="form-group form-group--inline">
                  <label>Trạng thái hoạt động</label>
                  <button
                    type="button"
                    className={`status-toggle ${formData.isActive ? "active" : ""}`}
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                  >
                    <span className="status-toggle__dot"></span>
                    <span>{formData.isActive ? "Hoạt động" : "Ẩn"}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
              >
                Hủy
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={showCreateModal ? handleCreate : handleUpdate}
                disabled={!formData.name.vi.trim()}
              >
                {showCreateModal ? "Tạo danh mục" : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && selectedCategory && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Xác nhận xóa</h2>
              <button
                className="modal__close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <p>
                Bạn có chắc chắn muốn xóa danh mục{" "}
                <strong>{selectedCategory.name.vi}</strong>?
              </p>
              {selectedCategory.termCount > 0 && (
                <div className="warning-box">
                  ⚠️ Danh mục này có {selectedCategory.termCount} thuật ngữ. Các
                  thuật ngữ sẽ được chuyển về danh mục mặc định.
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleDelete}
              >
                Xóa danh mục
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .category-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .category-stat {
          flex: 1;
          min-width: 200px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .category-stat__icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.1) 0%,
            rgba(118, 75, 162, 0.1) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
        }

        .category-stat__icon--success {
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.1) 0%,
            rgba(5, 150, 105, 0.1) 100%
          );
          color: #10b981;
        }

        .category-stat__icon--warning {
          background: linear-gradient(
            135deg,
            rgba(245, 158, 11, 0.1) 0%,
            rgba(217, 119, 6, 0.1) 100%
          );
          color: #f59e0b;
        }

        .category-stat__content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .category-stat__value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .category-stat__label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .category-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: 8px;
        }

        .view-toggle__btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle__btn.active {
          background: var(--bg-card);
          color: #667eea;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .category-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .category-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .category-card--inactive {
          opacity: 0.6;
        }

        .category-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .category-card__icon {
          font-size: 32px;
          line-height: 1;
        }

        .category-card__actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .category-card:hover .category-card__actions {
          opacity: 1;
        }

        .category-card__content {
          margin-bottom: 16px;
        }

        .category-card__name {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .category-card__name-en {
          margin: 0 0 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .category-card__desc {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .category-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .category-card__count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .status-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border: none;
          border-radius: 20px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-toggle__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-secondary);
          transition: all 0.2s;
        }

        .status-toggle.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-toggle.active .status-toggle__dot {
          background: #10b981;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-list-item {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .category-list-item:hover {
          border-color: #667eea;
        }

        .category-list-item--inactive {
          opacity: 0.6;
        }

        .category-list-item__main {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .category-list-item__drag {
          color: var(--text-secondary);
          cursor: grab;
        }

        .category-list-item__icon {
          font-size: 24px;
        }

        .category-list-item__info {
          flex: 1;
        }

        .category-list-item__info h4 {
          margin: 0 0 2px;
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .category-list-item__info span {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .category-list-item__count {
          font-size: 13px;
          color: var(--text-secondary);
          padding: 4px 12px;
          background: var(--bg-secondary);
          border-radius: 16px;
        }

        .category-list-item__actions {
          display: flex;
          gap: 4px;
        }

        .category-list-item__expanded {
          padding: 0 16px 16px;
          margin-top: -8px;
        }

        .category-list-item__expanded p {
          margin: 0 0 12px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .expanded-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .action-btn--danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }

        .modal {
          background: var(--bg-card);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal--sm {
          max-width: 400px;
        }

        .modal--md {
          max-width: 550px;
        }

        .modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal__header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .modal__close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
        }

        .modal__close:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .modal__body {
          padding: 24px;
          overflow-y: auto;
        }

        .modal__footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
        }

        .admin-form .form-group {
          margin-bottom: 16px;
        }

        .admin-form label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .admin-form .required {
          color: #ef4444;
        }

        .admin-form input,
        .admin-form textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s;
        }

        .admin-form input:focus,
        .admin-form textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .admin-form textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-group--inline {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .form-group--inline label {
          margin-bottom: 0;
        }

        .icon-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .icon-picker__item {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-picker__item:hover {
          border-color: #667eea;
        }

        .icon-picker__item.active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .warning-box {
          margin-top: 12px;
          padding: 12px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          font-size: 14px;
          color: #f59e0b;
        }

        @media (max-width: 768px) {
          .category-stats {
            flex-direction: column;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .category-list-item__main {
            flex-wrap: wrap;
          }

          .category-list-item__count {
            order: -1;
            width: 100%;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
}
