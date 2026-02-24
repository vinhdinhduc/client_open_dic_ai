"use client";

import React from "react";
import { AddTermForm } from "@/components/forms/manage_terms/AddTermForm";
import "../terms.scss";

export default function NewTermPage() {
  return (
    <div className="terms-page">
      <AddTermForm />
    </div>
  );
}
