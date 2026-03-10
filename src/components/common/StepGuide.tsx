"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import "./StepGuide.scss";

export interface GuideStep {
  title: string;
  description: string;
  tip?: string;
}

interface StepGuideProps {
  title: string;
  steps: GuideStep[];
  defaultOpen?: boolean;
}

export default function StepGuide({
  title,
  steps,
  defaultOpen = false,
}: StepGuideProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`step-guide ${isOpen ? "step-guide--open" : ""}`}>
      <button
        type="button"
        className="step-guide__toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="step-guide__toggle-left">
          <HelpCircle size={18} />
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="step-guide__content">
          {steps.map((step, index) => (
            <div key={index} className="step-guide__step">
              <div className="step-guide__step-number">
                <span>{index + 1}</span>
              </div>
              <div className="step-guide__step-body">
                <h4 className="step-guide__step-title">{step.title}</h4>
                <p className="step-guide__step-desc">{step.description}</p>
                {step.tip && (
                  <div className="step-guide__step-tip">
                    <CheckCircle2 size={14} />
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
