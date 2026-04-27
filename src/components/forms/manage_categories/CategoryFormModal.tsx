"use client";

import { useState, useEffect } from "react";
import {
  X,
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
  BookOpen,
  Book,
  Search,
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
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Building2,
  School,
  Briefcase,
  PenTool,
  Camera,
  Music2,
  Film,
  Headphones,
  Heart,
  FlaskConical,
  Microscope,
  Calculator,
  Gavel,
  Landmark,
  Palette,
  type LucideIcon,
} from "lucide-react";
import "./CategoryFormModal.scss";

// Danh sách icon dùng Lucide React
const iconList: { name: string; icon: LucideIcon }[] = [
  { name: "laptop", icon: Laptop },
  { name: "smartphone", icon: Smartphone },
  { name: "monitor", icon: Monitor },
  { name: "keyboard", icon: Keyboard },
  { name: "mouse", icon: Mouse },
  { name: "hard-drive", icon: HardDrive },
  { name: "disc", icon: Disc },
  { name: "plug", icon: Plug },
  { name: "battery", icon: Battery },
  { name: "radio", icon: Radio },
  { name: "satellite", icon: Satellite },
  { name: "wrench", icon: Wrench },
  { name: "hammer", icon: Hammer },
  { name: "settings", icon: Settings },
  { name: "link", icon: Link },
  { name: "bar-chart", icon: BarChart3 },
  { name: "trending-up", icon: TrendingUp },
  { name: "trending-down", icon: TrendingDown },
  { name: "clipboard", icon: ClipboardList },
  { name: "folder", icon: Folder },
  { name: "folder-open", icon: FolderOpen },
  { name: "layers", icon: Layers },
  { name: "newspaper", icon: Newspaper },
  { name: "book-open", icon: BookOpen },
  { name: "book", icon: Book },
  { name: "search", icon: Search },
  { name: "zoom-in", icon: ZoomIn },
  { name: "lightbulb", icon: Lightbulb },
  { name: "lock", icon: Lock },
  { name: "key", icon: Key },
  { name: "key-round", icon: KeyRound },
  { name: "shield", icon: Shield },
  { name: "sword", icon: Sword },
  { name: "target", icon: Target },
  { name: "gamepad", icon: Gamepad2 },
  { name: "globe", icon: Globe },
  { name: "cloud", icon: Cloud },
  { name: "zap", icon: Zap },
  { name: "flame", icon: Flame },
  { name: "droplet", icon: Droplet },
  { name: "sprout", icon: Sprout },
  { name: "leaf", icon: Leaf },
  { name: "code", icon: Code },
  { name: "database", icon: Database },
  { name: "server", icon: Server },
  { name: "wifi", icon: Wifi },
  { name: "cpu", icon: Cpu },
  { name: "memory", icon: MemoryStick },
  { name: "circuit", icon: CircuitBoard },
  { name: "network", icon: Network },
  { name: "car", icon: Car },
  { name: "bus", icon: Bus },
  { name: "train", icon: Train },
  { name: "plane", icon: Plane },
  { name: "ship", icon: Ship },
  { name: "building", icon: Building2 },
  { name: "school", icon: School },
  { name: "briefcase", icon: Briefcase },
  { name: "pen-tool", icon: PenTool },
  { name: "camera", icon: Camera },
  { name: "music", icon: Music2 },
  { name: "film", icon: Film },
  { name: "headphones", icon: Headphones },
  { name: "heart", icon: Heart },
  { name: "flask", icon: FlaskConical },
  { name: "microscope", icon: Microscope },
  { name: "calculator", icon: Calculator },
  { name: "gavel", icon: Gavel },
  { name: "landmark", icon: Landmark },
  { name: "palette", icon: Palette },
];

export interface CategoryFormDataType {
  name: { vi: string; en: string; lo: string };
  description: { vi: string; en: string; lo: string };
  icon: string;
  isActive: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  initialData?: CategoryFormDataType;
  onSubmit: (data: CategoryFormDataType) => Promise<void>;
  submitting?: boolean;
}

const CategoryFormModal = ({
  isOpen,
  mode,
  onClose,
  initialData,
  onSubmit,
  submitting = false,
}: CategoryFormModalProps) => {
  const [formData, setFormData] = useState<CategoryFormDataType>({
    name: { vi: "", en: "", lo: "" },
    description: { vi: "", en: "", lo: "" },
    icon: "laptop",
    isActive: true,
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (!isOpen) {
      setFormData({
        name: { vi: "", en: "", lo: "" },
        description: { vi: "", en: "", lo: "" },
        icon: "laptop",
        isActive: true,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--md category-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2>
            {mode === "edit" ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h2>
          <button className="modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal__body">
          <div className="admin-form">
            {/* Icon Picker */}
            <div className="form-group">
              <label>Icon</label>
              <div className="icon-picker">
                {iconList.map(({ name, icon: IconComponent }) => (
                  <button
                    key={name}
                    type="button"
                    className={`icon-picker__item ${formData.icon === name ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, icon: name })}
                    title={name}
                  >
                    <IconComponent size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Vietnamese Name */}
            <div className="form-group">
              <label>
                Tên danh mục (Tiếng Việt) <span className="required">*</span>
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

            {/* English Description */}
            <div className="form-group">
              <label>Mô tả (English)</label>
              <textarea
                value={formData.description.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: {
                      ...formData.description,
                      en: e.target.value,
                    },
                  })
                }
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            {/* Lao Description */}
            <div className="form-group">
              <label>Mô tả (ພາສາລາວ)</label>
              <textarea
                value={formData.description.lo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: {
                      ...formData.description,
                      lo: e.target.value,
                    },
                  })
                }
                placeholder="ປ້ອນຄຳອະທິບາຍໝວດໝູ່"
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
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSubmit}
            disabled={!formData.name.vi.trim() || submitting}
          >
            {submitting
              ? "Đang xử lý..."
              : mode === "create"
                ? "Tạo danh mục"
                : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
