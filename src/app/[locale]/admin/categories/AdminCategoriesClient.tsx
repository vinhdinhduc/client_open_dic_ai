"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  FolderTree,
  Grid3X3,
  List,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Laptop,
  Smartphone,
  Monitor,
  Keyboard,
  Mouse,
  HardDrive,
  Disc,
  Plug,
  Battery,
  Radio,
  Satellite,
  Wrench,
  Hammer,
  Settings,
  Link,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  Folder,
  FolderOpen,
  Layers,
  Newspaper,
  Book,
  ZoomIn,
  Lightbulb,
  Lock,
  Key,
  KeyRound,
  Shield,
  Sword,
  Target,
  Gamepad2,
  Globe,
  Cloud,
  Zap,
  Flame,
  Droplet,
  Sprout,
  Leaf,
  Code,
  Database,
  Server,
  Wifi,
  Cpu,
  MemoryStick,
  CircuitBoard,
  Network,
  type LucideIcon,
} from "lucide-react";
import categoryService, { CategoryFormData } from "@/services/categoryService";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import CategoryFormModal from "@/components/forms/manage_categories/CategoryFormModal";
import "./categories.scss";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  laptop: Laptop,
  smartphone: Smartphone,
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  "hard-drive": HardDrive,
  disc: Disc,
  plug: Plug,
  battery: Battery,
  radio: Radio,
  satellite: Satellite,
  wrench: Wrench,
  hammer: Hammer,
  settings: Settings,
  link: Link,
  "bar-chart": BarChart3,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  clipboard: ClipboardList,
  folder: Folder,
  "folder-open": FolderOpen,
  layers: Layers,
  newspaper: Newspaper,
  "book-open": BookOpen,
  book: Book,
  search: Search,
  "zoom-in": ZoomIn,
  lightbulb: Lightbulb,
  lock: Lock,
  key: Key,
  "key-round": KeyRound,
  shield: Shield,
  sword: Sword,
  target: Target,
  gamepad: Gamepad2,
  globe: Globe,
  cloud: Cloud,
  zap: Zap,
  flame: Flame,
  droplet: Droplet,
  sprout: Sprout,
  leaf: Leaf,
  code: Code,
  database: Database,
  server: Server,
  wifi: Wifi,
  cpu: Cpu,
  memory: MemoryStick,
  circuit: CircuitBoard,
  network: Network,
};

// Helper function to render icon
const renderIcon = (iconName: string | React.ReactNode, size: number = 24) => {
  if (typeof iconName === "string") {
    const IconComponent = iconMap[iconName];
    if (IconComponent) {
      return <IconComponent size={size} />;
    }
    // Fallback for emoji or unknown icons
    return <span style={{ fontSize: size }}>{iconName}</span>;
  }
  return iconName;
};

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
    lo?: string;
  };
  slug?: string;
  icon?: string | React.ReactNode;
  parent?: string;
  order: number;
  termCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const t = useTranslations("adminCategories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: { vi: "", en: "", lo: "" },
    description: { vi: "", en: "", lo: "" },
    icon: "laptop",
    isActive: true,
  });

  // Slug generation helper
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories(true);
      if (res.success && Array.isArray(res.data)) {
        const mappedCategories: Category[] = res.data.map((cat: any) => ({
          _id: cat.id || cat._id,
          name:
            typeof cat.name === "string"
              ? { vi: cat.name, en: "", lo: "" }
              : cat.name || { vi: "", en: "", lo: "" },
          description:
            typeof cat.description === "string"
              ? { vi: cat.description, en: "", lo: "" }
              : cat.description || { vi: "", en: "", lo: "" },
          slug: cat.slug,
          icon: cat.icon || "💻",
          parent: cat.parentCategory,
          order: cat.order || 0,
          termCount: cat.termCount || 0,
          isActive: cat.isActive !== false,
          createdAt: cat.createdAt || new Date().toISOString(),
        }));
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      description: { vi: "", en: "", lo: "" },
      icon: "laptop",
      isActive: true,
    });
  };

  const handleShowAddModal = () => {
    setIsOpen(true);
    setMode("create");
  };

  const onClose = () => {
    setIsOpen(false);
    setSelectedCategory(null);
    resetForm();
  };

  const handleShowEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: {
        vi: category.name.vi || "",
        en: category.name.en || "",
        lo: category.name.lo || "",
      },
      description: {
        vi: category.description?.vi || "",
        en: category.description?.en || "",
        lo: category.description?.lo || "",
      },
      icon: typeof category.icon === "string" ? category.icon : "laptop",
      isActive: category.isActive,
    });
    setMode("edit");
    setIsOpen(true);
  };

  const handleSubmit = async (data: {
    name: { vi: string; en: string; lo: string };
    description: { vi: string; en: string; lo: string };
    icon: string;
    isActive: boolean;
  }) => {
    if (!data.name.vi.trim()) {
      toast.error(t("nameViRequired"));
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        const slug = generateSlug(data.name.vi);
        const categoryData: CategoryFormData = {
          name: {
            vi: data.name.vi.trim(),
            en: data.name.en.trim() || undefined,
            lo: data.name.lo.trim() || undefined,
          },
          description: {
            vi: data.description.vi.trim() || undefined,
            en: data.description.en.trim() || undefined,
            lo: data.description.lo.trim() || undefined,
          },
          icon: data.icon,
          slug: slug,
          isActive: data.isActive,
          order: categories.length + 1,
        };

        const res = await categoryService.createCategory(categoryData);
        if (res.success) {
          toast.success(t("createSuccess"));
          onClose();
          fetchCategories();
        }
      } else if (selectedCategory) {
        const updateData: Partial<CategoryFormData> = {
          name: {
            vi: data.name.vi.trim(),
            en: data.name.en.trim() || undefined,
            lo: data.name.lo.trim() || undefined,
          },
          description: {
            vi: data.description.vi.trim() || undefined,
            en: data.description.en.trim() || undefined,
            lo: data.description.lo.trim() || undefined,
          },
          icon: data.icon,
          isActive: data.isActive,
        };

        const res = await categoryService.updateCategory(
          selectedCategory._id,
          updateData,
        );
        if (res.success) {
          toast.success(t("updateSuccess"));
          onClose();
          fetchCategories();
        }
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (mode === "create"
          ? t("createError")
          : t("updateError"));
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);
    setDeleteErrorMsg(null);
    try {
      const res = await categoryService.deleteCategory(selectedCategory._id);
      if (res.success) {
        toast.success(t("deleteSuccess"));
        setShowDeleteConfirm(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t("deleteError");
      setDeleteErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);
    try {
      const res = await categoryService.deactivateCategory(
        selectedCategory._id,
      );
      if (res.success) {
        toast.success(t("hiddenSuccess"));
        setShowDeleteConfirm(false);
        setSelectedCategory(null);
        setDeleteErrorMsg(null);
        fetchCategories();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t("hideError");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    if (
      !confirm(
        `${category.isActive ? t("confirmToggleHide") : t("confirmToggleActivate")} "${category.name.vi}"?`,
      )
    ) {
      return;
    }
    try {
      const res = await categoryService.updateCategory(category._id, {
        isActive: !category.isActive,
      });
      if (res.success) {
        toast.success(
          category.isActive ? t("hiddenCategory") : t("activatedCategory"),
        );
        fetchCategories();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || t("toggleStatusError");
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="categories-page">
        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-header__title">{t("title")}</h1>
            <p className="admin-page-header__subtitle">
              {t("subtitle")}
            </p>
          </div>
          <div className="admin-page-header__actions">
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleShowAddModal}
            >
              <Plus size={16} />
              {t("addCategory")}
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
              <span className="category-stat__label">{t("totalCategories")}</span>
            </div>
          </div>
          <div className="category-stat">
            <div className="category-stat__icon category-stat__icon--success">
              <BookOpen size={24} />
            </div>
            <div className="category-stat__content">
              <span className="category-stat__value">{totalTerms}</span>
              <span className="category-stat__label">{t("totalTerms")}</span>
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
              <span className="category-stat__label">{t("activeCount")}</span>
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
                placeholder={t("searchPlaceholder")}
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
                    <span className="category-card__icon">
                      {renderIcon(category.icon, 32)}
                    </span>
                    <div className="category-card__actions">
                      <button
                        className="action-btn"
                        onClick={() => handleShowEditModal(category)}
                        title={t("edit")}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn action-btn--danger"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowDeleteConfirm(true);
                        }}
                        title={t("delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="category-card__content">
                    <h3 className="category-card__name">{category.name.vi}</h3>
                    {category.name.en && (
                      <p className="category-card__name-en">
                        {category.name.en}
                      </p>
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
                      {category.termCount} {t("termsCount")}
                    </span>
                    <button
                      className={`status-toggle ${category.isActive ? "active" : ""}`}
                      onClick={() => handleToggleActive(category)}
                    >
                      <span className="status-toggle__dot"></span>
                      <span>{category.isActive ? t("active") : t("hidden")}</span>
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
                      {renderIcon(category.icon, 24)}
                    </span>
                    <div className="category-list-item__info">
                      <h4>{category.name.vi}</h4>
                      {category.name.en && <span>{category.name.en}</span>}
                    </div>
                    <span className="category-list-item__count">
                      {category.termCount} {t("termsCount")}
                    </span>
                    <button
                      className={`status-toggle ${category.isActive ? "active" : ""}`}
                      onClick={() => handleToggleActive(category)}
                    >
                      <span className="status-toggle__dot"></span>
                      <span>{category.isActive ? t("active") : t("hidden")}</span>
                    </button>
                    <div className="category-list-item__actions">
                      <button
                        className="action-btn"
                        onClick={() => handleShowEditModal(category)}
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
                      <p>{category.description?.vi || t("noDescription")}</p>
                      <div className="expanded-meta">
                        <span>{t("order")} {category.order}</span>
                        <span>
                          {t("createdDate")}{" "}
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
              <h3>{t("noCategories")}</h3>
              <p>{t("noCategoriesHint")}</p>
            </div>
          )}
        </div>

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && selectedCategory && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteErrorMsg(null);
            }}
          >
            <div
              className="modal modal--sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__header">
                <h2>{t("confirmDelete")}</h2>
                <button
                  className="modal__close"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteErrorMsg(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal__body">
                {!deleteErrorMsg ? (
                  <>
                    <p>
                      {t("confirmDeleteMsg")}{" "}
                      <strong>{selectedCategory.name.vi}</strong>?
                    </p>
                    <p className="text-warning" style={{ marginTop: 8 }}>
                      {t("deleteIrreversible")}
                    </p>
                  </>
                ) : (
                  <div
                    className="delete-error-box"
                    style={{
                      background: "#fff7ed",
                      border: "1.5px solid #f97316",
                      borderRadius: 8,
                      padding: "12px 16px",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#c2410c",
                        marginBottom: 6,
                      }}
                    >
                      ⚠️ {t("cannotDelete")}
                    </p>
                    <p style={{ color: "#9a3412", fontSize: 14 }}>
                      {deleteErrorMsg}
                    </p>
                    <p style={{ color: "#78350f", fontSize: 13, marginTop: 8 }}>
                      {t("hideInstead")}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal__footer">
                <button
                  className="admin-btn admin-btn--secondary"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteErrorMsg(null);
                  }}
                  disabled={submitting}
                >
                  {t("cancel")}
                </button>
                {deleteErrorMsg ? (
                  <button
                    className="admin-btn admin-btn--warning"
                    onClick={handleDeactivate}
                    disabled={submitting}
                  >
                    {submitting ? t("processing") : t("hideCategory")}
                  </button>
                ) : (
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    {submitting ? t("deleting") : t("deleteCategory")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CategoryFormModal
        isOpen={isOpen}
        mode={mode}
        onClose={onClose}
        onSubmit={handleSubmit}
        initialData={formData}
        submitting={submitting}
      />
    </>
  );
}
