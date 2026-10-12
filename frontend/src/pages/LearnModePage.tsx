import React, { useState } from 'react';
import {
  GraduationCap,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const LearnModePage: React.FC = () => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const vivaTopics = [
    {
      question: "Why is Random Forest well-suited for Wine Quality Prediction?",
      answer: "Wine quality is determined by complex non-linear physicochemical interactions (e.g., volatile acidity and sulfur dioxide interact to determine spoilage, while alcohol and residual sugar modulate body). Random Forest builds an ensemble of de-correlated decision trees with bagging (bootstrap aggregation) and random feature subspace sampling. It captures non-linear thresholds naturally, is robust against outliers, and provides feature importance metrics without requiring monotonic scaling."
    },
    {
      question: "Why is K-Nearest Neighbors (KNN) an ideal comparison baseline?",
      answer: "KNN operates under a completely different paradigm: it is a non-parametric, instance-based 'lazy learner'. While Random Forest creates global partition boundaries, KNN classifies a wine based purely on local similarity to nearby samples in scaled metric space. Comparing an ensemble tree model with an instance-based model demonstrates how different algorithmic assumptions handle continuous chemical data."
    },
    {
      question: "Why is Feature Scaling strictly mandatory for KNN but unnecessary for Random Forest?",
      answer: "KNN calculates geometric distances (Euclidean or Manhattan) between sample vectors: d = sqrt(sum((x_i - y_i)^2)). In the wine dataset, Total Sulfur Dioxide ranges up to 440, while Chlorides are around 0.045. Without scaling, Total Sulfur Dioxide would dominate the distance calculation by a factor of 10,000, rendering chlorides and pH completely ignored. Random Forest, in contrast, splits one feature at a time based on sorting order; any strictly monotonic transformation produces the identical split, making scaling unnecessary."
    },
    {
      question: "What is Data Leakage and how is it prevented in this project?",
      answer: "Data leakage occurs when information from outside the training partition is inadvertently used to train or preprocess the model. If StandardScaler was fitted on the whole dataset before splitting, the test set's mean and standard deviation would influence the training inputs. In NeuroML Studio, StandardScaler.fit() is executed exclusively on X_train. The test set is only transformed via scaler.transform(X_test), guaranteeing a clean, realistic evaluation."
    },
    {
      question: "Why is a 70:30 Train/Test Split used?",
      answer: "A 70:30 split represents an established standard in statistical machine learning for medium-scale datasets (such as 4,898 white wine samples). 70% (~3,428 samples) provides ample statistical power for training trees without severe underfitting, while 30% (~1,470 samples) retains a statistically robust holdout set to detect overfitting and evaluate generalization variance."
    },
    {
      question: "Why is Accuracy alone misleading on the Wine Quality dataset?",
      answer: "The wine dataset exhibits significant class imbalance: scores 5, 6, and 7 account for over 90% of all samples, while rare vintage scores 3, 4, 8, and 9 comprise less than 10%. A naive classifier predicting 'Score 6' for every sample could achieve ~45% raw accuracy while being completely useless. Therefore, we report Macro F1-score, Weighted Precision, Weighted Recall, and the full Confusion Matrix to evaluate class-by-class predictive fidelity."
    },
    {
      question: "How does SHAP TreeExplainer work mathematically?",
      answer: "SHAP (SHapley Additive exPlanations) is based on cooperative game theory. It calculates the fair marginal contribution φ_i of each feature across all possible subsets of features S ⊆ F \\ {i}. For tree ensembles, TreeExplainer optimizes this exponential calculation into polynomial time O(TLD^2) (where T is trees, L is leaves, D is depth) by recursively tracking conditional expectations along decision paths."
    },
    {
      question: "How should you interpret a Confusion Matrix during a Viva?",
      answer: "Walk the examiner through the diagonal versus off-diagonal cells: Diagonal cells (C_ii) represent correct predictions (True Positives). Off-diagonal cells represent misclassifications. In wine quality, observe whether errors are off by only ±1 score (e.g., predicting 6 when actual was 5), which indicates reasonable model calibration, versus catastrophic multi-tier errors (predicting 8 when actual was 4)."
    }
  ];

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-[#22263d] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>B.Tech AIML Examination Prep</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Educational Mode & Viva Voce Guide
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Comprehensive theoretical questions, mathematical intuitions, and viva review answers for university project defense.
        </p>
      </div>

      {/* Accordion Questions */}
      <div className="space-y-4">
        {vivaTopics.map((item, idx) => {
          const isOpen = openSection === idx;

          return (
            <div
              key={idx}
              className="bg-[#0f111e] rounded-2xl border border-[#22263d] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenSection(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#15182a]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-violet-950 text-violet-300 border border-violet-800/40 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {item.question}
                  </span>
                </div>

                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-[#22263d]/60 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  <div className="bg-[#15182a] p-4 rounded-xl border border-cyan-500/20 text-slate-200">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
