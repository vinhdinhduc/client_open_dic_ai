"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CardLoading } from "@/components/common";
import { Layout } from "@/components/layouts";
import TermDetailView from "@/components/terms/TermDetailView";
import { TermDetail } from "@/components/terms/types";
import { getTermById, incrementTermView } from "@/services/termService";
import "./TermDetail.scss";
import { MoveLeft } from "lucide-react";

export default function TermDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("term");

  const [term, setTerm] = useState<TermDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ref guard to prevent double view-count increment in React StrictMode
  const viewIncrementedRef = useRef<string | null>(null);

  useEffect(() => {
    async function fetchTermDetail() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getTermById(id);
        console.log("Check data ", data);

        if (data) {
          setTerm(data);
          // Increment view only once per term id (prevents StrictMode double-fire)
          if (viewIncrementedRef.current !== id) {
            viewIncrementedRef.current = id;
            incrementTermView(id);
          }
        } else {
          setError("Không tìm thấy thuật ngữ");
        }
      } catch (err) {
        console.error("Error fetching term:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }

    fetchTermDetail();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="term-detail-page term-detail-page--loading">
          <CardLoading text="Đang tải thuật ngữ..." />
        </div>
      </Layout>
    );
  }

  if (error || !term) {
    return (
      <Layout>
        <div className="term-detail-page term-detail-page--error">
          <div className="error-container">
            <h2>{error || "Không tìm thấy thuật ngữ"}</h2>
            <p>Thuật ngữ bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <a href="/terms" className="back-link">
              <MoveLeft /> Quay lại tìm kiếm
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="term-detail-page">
        <TermDetailView term={term} />
      </div>
    </Layout>
  );
}
