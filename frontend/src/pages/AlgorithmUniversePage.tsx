import React, { useState, useEffect } from 'react';
import {
  Search,
  Play,
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Sparkles,
  Database,
  BarChart2,
  Download,
  ArrowRight,
  Sliders,
  Check,
  TrendingUp,
  Activity,
  GitBranch,
  Zap,
  Cpu,
  Target,
  Compass,
  Binary,
  Layers,
  Flame,
  Scale,
  Radar
} from 'lucide-react';
import { DatasetSummary, ModelMetricsResponse } from '../types';
import { fetchDatasets, trainModel } from '../services/api';
import { ConfusionMatrixChart } from '../components/charts/ConfusionMatrixChart';
import { FeatureImportanceChart } from '../components/charts/FeatureImportanceChart';

interface AlgorithmUniverseProps {
  onTrainModel?: (algorithmId: string) => void;
  onLearnMore?: (algorithmId: string) => void;
}

interface AlgorithmItem {
  id: string;
  name: string;
  group: 'Regression' | 'Classification';
  shortDef: string;
  howItWorks: string;
  advantages: string[];
  limitations: string[];
  useCases: string;
  hyperparameters: string[];
  implemented: boolean;
}

const ALL_ALGORITHMS: AlgorithmItem[] = [
  // ───────────────────────── REGRESSION ─────────────────────────
  {
    id: 'linear_regression',
    name: 'Linear Regression',
    group: 'Regression',
    shortDef: 'Predicts numerical values using a linear relationship between features.',
    howItWorks: 'Fits a hyperplane to minimise the residual sum of squares between predictions and actual values.',
    advantages: ['Simple and interpretable', 'Fast training', 'Low variance'],
    limitations: ['Assumes linear relationship', 'Sensitive to outliers', 'Multicollinearity issues'],
    useCases: 'House price prediction, salary estimation, sales forecasting.',
    hyperparameters: ['fit_intercept'],
    implemented: true,
  },
  {
    id: 'multiple_linear_regression',
    name: 'Multiple Linear Regression',
    group: 'Regression',
    shortDef: 'Uses multiple features to predict a numerical value.',
    howItWorks: 'Extends simple linear regression by fitting a hyperplane across multiple input dimensions.',
    advantages: ['Handles multiple predictors', 'Easy to interpret coefficients', 'Efficient'],
    limitations: ['Assumes linearity', 'Affected by multicollinearity', 'Cannot capture interactions'],
    useCases: 'Economic modelling, real estate valuation, yield prediction.',
    hyperparameters: ['fit_intercept'],
    implemented: true,
  },
  {
    id: 'polynomial_regression',
    name: 'Polynomial Regression',
    group: 'Regression',
    shortDef: 'Models nonlinear relationships using polynomial feature terms.',
    howItWorks: 'Adds polynomial feature expansions then applies linear regression on the expanded feature set.',
    advantages: ['Captures nonlinear patterns', 'Simple extension of linear regression', 'Flexible'],
    limitations: ['Prone to overfitting at high degree', 'Computationally expensive', 'Poor extrapolation'],
    useCases: 'Curve fitting, growth-rate modelling, scientific data.',
    hyperparameters: ['degree'],
    implemented: true,
  },
  {
    id: 'ridge_regression',
    name: 'Ridge Regression',
    group: 'Regression',
    shortDef: 'Reduces overfitting via L2 regularisation on coefficients.',
    howItWorks: 'Adds a squared-magnitude penalty to the cost function to shrink large coefficients.',
    advantages: ['Handles multicollinearity', 'Reduces overfitting', 'Stable solution'],
    limitations: ['Cannot zero-out features', 'Requires hyperparameter tuning', 'Still assumes linearity'],
    useCases: 'Financial modelling, gene expression, high-dimensional data.',
    hyperparameters: ['alpha'],
    implemented: true,
  },
  {
    id: 'lasso_regression',
    name: 'Lasso Regression',
    group: 'Regression',
    shortDef: 'Uses L1 regularisation and can eliminate irrelevant features.',
    howItWorks: 'Adds an absolute-value penalty that forces some coefficients exactly to zero, performing feature selection.',
    advantages: ['Built-in feature selection', 'Sparse model', 'Interpretable'],
    limitations: ['Struggles with correlated features', 'Can be too aggressive', 'Non-differentiable at zero'],
    useCases: 'Genomics, text modelling, feature selection pipelines.',
    hyperparameters: ['alpha'],
    implemented: true,
  },
  {
    id: 'elastic_net_regression',
    name: 'Elastic Net Regression',
    group: 'Regression',
    shortDef: 'Combines Ridge (L2) and Lasso (L1) regularisation.',
    howItWorks: 'Blends both penalties, balancing feature selection and coefficient shrinkage.',
    advantages: ['Handles correlated features better than Lasso', 'Feature selection', 'Flexible penalty'],
    limitations: ['Two hyperparameters to tune', 'Computationally heavier', 'Assumes linearity'],
    useCases: 'Bioinformatics, finance, multi-collinear datasets.',
    hyperparameters: ['alpha', 'l1_ratio'],
    implemented: true,
  },
  {
    id: 'decision_tree_regressor',
    name: 'Decision Tree Regressor',
    group: 'Regression',
    shortDef: 'Predicts values using recursive binary decision rules.',
    howItWorks: 'Recursively splits data to minimise mean squared error at each node, producing piecewise constant predictions.',
    advantages: ['Interpretable', 'No scaling required', 'Handles nonlinearities'],
    limitations: ['Prone to overfitting', 'High variance', 'Unstable with small data changes'],
    useCases: 'Price modelling, decision support, tabular regression.',
    hyperparameters: ['max_depth', 'min_samples_split', 'min_samples_leaf'],
    implemented: true,
  },
  {
    id: 'random_forest_regressor',
    name: 'Random Forest Regressor',
    group: 'Regression',
    shortDef: 'Combines predictions from multiple decision tree regressors.',
    howItWorks: 'Averages outputs of many decision trees trained on bootstrap samples with random feature subsets.',
    advantages: ['High accuracy', 'Robust to outliers', 'Feature importances'],
    limitations: ['Slow inference', 'High memory', 'Less interpretable'],
    useCases: 'Energy consumption, house prices, sensor data.',
    hyperparameters: ['n_estimators', 'max_depth', 'min_samples_split'],
    implemented: true,
  },
  {
    id: 'gradient_boosting_regressor',
    name: 'Gradient Boosting Regressor',
    group: 'Regression',
    shortDef: 'Builds models sequentially to reduce prediction errors.',
    howItWorks: 'Each new tree corrects the residuals of the previous ensemble using gradient descent in function space.',
    advantages: ['Very high accuracy', 'Handles mixed feature types', 'Flexible loss functions'],
    limitations: ['Risk of overfitting', 'Slow training', 'Many hyperparameters'],
    useCases: 'Ranking, click-through-rate prediction, tabular regression competitions.',
    hyperparameters: ['n_estimators', 'learning_rate', 'max_depth'],
    implemented: true,
  },
  {
    id: 'xgboost_regressor',
    name: 'XGBoost Regressor',
    group: 'Regression',
    shortDef: 'Uses optimised gradient-boosted trees for regression.',
    howItWorks: 'Implements regularised boosting with second-order gradient statistics for fast, accurate tree building.',
    advantages: ['State-of-the-art accuracy', 'Built-in regularisation', 'Handles missing values'],
    limitations: ['Many hyperparameters', 'Can overfit', 'Less interpretable'],
    useCases: 'Kaggle competitions, financial modelling, demand forecasting.',
    hyperparameters: ['n_estimators', 'learning_rate', 'max_depth', 'reg_alpha', 'reg_lambda'],
    implemented: true,
  },
  {
    id: 'lightgbm_regressor',
    name: 'LightGBM Regressor',
    group: 'Regression',
    shortDef: 'Efficient gradient-boosting using leaf-wise tree growth.',
    howItWorks: 'Grows trees leaf-wise (instead of level-wise) and uses histogram-based feature binning for speed.',
    advantages: ['Very fast training', 'Low memory', 'Handles large datasets'],
    limitations: ['Prone to overfitting on small data', 'Sensitive to hyperparameters', 'Complex'],
    useCases: 'Large-scale regression, real-time scoring, industry ML pipelines.',
    hyperparameters: ['n_estimators', 'learning_rate', 'num_leaves'],
    implemented: true,
  },
  {
    id: 'catboost_regressor',
    name: 'CatBoost Regressor',
    group: 'Regression',
    shortDef: 'Gradient boosting designed for strong categorical-feature support.',
    howItWorks: 'Uses ordered boosting and target-based encoding to handle categoricals natively without preprocessing.',
    advantages: ['Excellent with categoricals', 'Less tuning required', 'Robust to overfitting'],
    limitations: ['Slow training on CPU', 'Large model size', 'Less community resources than XGBoost'],
    useCases: 'E-commerce recommendation, loan default prediction, CRM analytics.',
    hyperparameters: ['iterations', 'learning_rate', 'depth'],
    implemented: true,
  },
  {
    id: 'svr',
    name: 'Support Vector Regression (SVR)',
    group: 'Regression',
    shortDef: 'Predicts numerical values using support vector methods.',
    howItWorks: 'Finds a hyperplane within an epsilon-insensitive tube that best approximates the data.',
    advantages: ['Effective in high dimensions', 'Robust to outliers', 'Kernel flexibility'],
    limitations: ['Slow on large datasets', 'Requires scaling', 'Difficult to tune'],
    useCases: 'Time-series prediction, bioinformatics, small-sample regression.',
    hyperparameters: ['C', 'epsilon', 'kernel'],
    implemented: true,
  },
  {
    id: 'knn_regressor',
    name: 'KNN Regressor',
    group: 'Regression',
    shortDef: 'Predicts numerical values by averaging nearby data points.',
    howItWorks: 'Finds K nearest training samples and returns the mean (or weighted mean) of their target values.',
    advantages: ['Simple', 'Non-parametric', 'No training phase'],
    limitations: ['Slow inference', 'Requires scaling', 'High memory usage'],
    useCases: 'Spatial interpolation, recommendation systems, image inpainting.',
    hyperparameters: ['n_neighbors', 'weights', 'metric'],
    implemented: true,
  },
  {
    id: 'bayesian_regression',
    name: 'Bayesian Regression',
    group: 'Regression',
    shortDef: 'Models predictions using probability distributions over coefficients.',
    howItWorks: 'Infers posterior distributions over weights using Bayes\' theorem, providing uncertainty estimates.',
    advantages: ['Uncertainty quantification', 'Handles small datasets', 'Automatic regularisation'],
    limitations: ['Computationally expensive', 'Assumes Gaussian priors', 'Complex setup'],
    useCases: 'Scientific experiments, finance uncertainty, A/B testing.',
    hyperparameters: ['alpha_1', 'alpha_2', 'lambda_1', 'lambda_2'],
    implemented: true,
  },
  {
    id: 'gaussian_process_regression',
    name: 'Gaussian Process Regression',
    group: 'Regression',
    shortDef: 'Provides predictions with full uncertainty estimates via Gaussian processes.',
    howItWorks: 'Defines a prior over functions using a kernel function, updated to a posterior given observations.',
    advantages: ['Full uncertainty quantification', 'Non-parametric', 'Works well on small datasets'],
    limitations: ['O(n³) scaling', 'Kernel selection is critical', 'Memory intensive'],
    useCases: 'Bayesian optimisation, robotics, scientific computing.',
    hyperparameters: ['kernel', 'alpha (noise level)'],
    implemented: true,
  },

  // ───────────────────────── CLASSIFICATION ─────────────────────────
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    group: 'Classification',
    shortDef: 'Predicts class probabilities using a logistic (sigmoid) function.',
    howItWorks: 'Learns linear decision boundaries by maximising the log-likelihood of observed classes.',
    advantages: ['Fast', 'Probabilistic output', 'Interpretable coefficients'],
    limitations: ['Assumes linear boundary', 'Struggles with complex patterns', 'Needs feature scaling'],
    useCases: 'Spam detection, medical diagnosis, credit scoring.',
    hyperparameters: ['C', 'penalty', 'solver'],
    implemented: true,
  },
  {
    id: 'knn',
    name: 'K-Nearest Neighbors (KNN)',
    group: 'Classification',
    shortDef: 'Classifies samples based on majority vote among K nearest training points.',
    howItWorks: 'Computes distances between query point and all training samples, takes K closest, votes for class.',
    advantages: ['Simple intuition', 'No training phase', 'Naturally multi-class'],
    limitations: ['Slow inference', 'Sensitive to irrelevant features', 'Requires scaling'],
    useCases: 'Wine quality, image recognition, anomaly detection.',
    hyperparameters: ['n_neighbors', 'metric', 'weights'],
    implemented: true,
  },
  {
    id: 'decision_tree',
    name: 'Decision Tree Classifier',
    group: 'Classification',
    shortDef: 'Classifies data using a tree of binary decision rules.',
    howItWorks: 'Recursively splits data by feature thresholds to maximise information gain or Gini impurity reduction.',
    advantages: ['Fully interpretable', 'No scaling required', 'Handles nonlinearities'],
    limitations: ['Prone to overfitting', 'Unstable', 'Biased to dominant classes'],
    useCases: 'Decision support, fraud detection, medical triage.',
    hyperparameters: ['max_depth', 'criterion', 'min_samples_split'],
    implemented: true,
  },
  {
    id: 'random_forest',
    name: 'Random Forest Classifier',
    group: 'Classification',
    shortDef: 'Ensemble of decision trees trained on bootstrap samples with random features.',
    howItWorks: 'Aggregates votes from many diverse decision trees; diversity reduces variance and overfitting.',
    advantages: ['High accuracy', 'Feature importance', 'Handles imbalanced classes'],
    limitations: ['Slow inference', 'Black-box', 'High memory'],
    useCases: 'Wine quality, medical imaging, tabular classification.',
    hyperparameters: ['n_estimators', 'max_depth', 'max_features'],
    implemented: true,
  },
  {
    id: 'svm',
    name: 'Support Vector Machine (SVM)',
    group: 'Classification',
    shortDef: 'Finds the maximum-margin hyperplane separating classes.',
    howItWorks: 'Maps data to high-dimensional space via kernel trick and finds the hyperplane maximising class margin.',
    advantages: ['Effective in high dimensions', 'Kernel flexibility', 'Robust to outliers'],
    limitations: ['Slow on large datasets', 'Requires careful kernel/C tuning', 'Memory intensive'],
    useCases: 'Text classification, image recognition, bioinformatics.',
    hyperparameters: ['C', 'kernel', 'gamma'],
    implemented: true,
  },
  {
    id: 'naive_bayes',
    name: 'Naive Bayes',
    group: 'Classification',
    shortDef: 'Probabilistic classifier based on Bayes\' theorem with feature independence assumption.',
    howItWorks: 'Computes posterior probability of each class given features, assuming features are conditionally independent.',
    advantages: ['Very fast', 'Works with small data', 'Probabilistic output'],
    limitations: ['Strong independence assumption', 'Poor with correlated features', 'Cannot learn feature interactions'],
    useCases: 'Text classification, spam filtering, real-time prediction.',
    hyperparameters: ['var_smoothing'],
    implemented: true,
  },
  {
    id: 'gaussian_naive_bayes',
    name: 'Gaussian Naive Bayes',
    group: 'Classification',
    shortDef: 'Assumes continuous features follow a Gaussian distribution within each class.',
    howItWorks: 'Estimates mean and variance per class per feature, uses Gaussian PDF for likelihood.',
    advantages: ['Fast', 'Works on continuous data', 'Low data requirements'],
    limitations: ['Assumes Gaussian distribution', 'Independence assumption', 'Not always accurate'],
    useCases: 'Sensor data classification, medical diagnostics.',
    hyperparameters: ['var_smoothing'],
    implemented: true,
  },
  {
    id: 'multinomial_naive_bayes',
    name: 'Multinomial Naive Bayes',
    group: 'Classification',
    shortDef: 'Designed for count-based or frequency-based text features.',
    howItWorks: 'Uses multinomial distribution to model feature counts per class; common in NLP pipelines.',
    advantages: ['Excellent for text', 'Fast', 'Handles large feature spaces'],
    limitations: ['Requires non-negative features', 'Independence assumption', 'Not ideal for continuous data'],
    useCases: 'Text classification, document categorisation, spam filtering.',
    hyperparameters: ['alpha (smoothing)'],
    implemented: true,
  },
  {
    id: 'bernoulli_naive_bayes',
    name: 'Bernoulli Naive Bayes',
    group: 'Classification',
    shortDef: 'Works with binary (presence/absence) features.',
    howItWorks: 'Models each feature as a Bernoulli trial (0 or 1), suitable for binary document representation.',
    advantages: ['Handles binary data well', 'Fast', 'Simple'],
    limitations: ['Only binary features', 'Strong independence assumption', 'Loses magnitude info'],
    useCases: 'Sentiment analysis, spam detection, binary feature datasets.',
    hyperparameters: ['alpha', 'binarize'],
    implemented: true,
  },
  {
    id: 'gradient_boosting',
    name: 'Gradient Boosting Classifier',
    group: 'Classification',
    shortDef: 'Combines sequentially trained weak learners to build a strong classifier.',
    howItWorks: 'Each tree is fitted to the negative gradient of the loss, progressively correcting errors.',
    advantages: ['High accuracy', 'Handles mixed data', 'Feature importances'],
    limitations: ['Slow training', 'Risk of overfitting', 'Sensitive to hyperparameters'],
    useCases: 'Fraud detection, churn prediction, click-through-rate.',
    hyperparameters: ['n_estimators', 'learning_rate', 'max_depth'],
    implemented: true,
  },
  {
    id: 'adaboost',
    name: 'AdaBoost',
    group: 'Classification',
    shortDef: 'Focuses subsequent learners on examples misclassified by previous ones.',
    howItWorks: 'Assigns higher weights to misclassified samples at each round, then combines weak learners by weighted vote.',
    advantages: ['Simple', 'Reduces bias', 'Less prone to overfitting than single trees'],
    limitations: ['Sensitive to noise/outliers', 'Slow on large datasets', 'Weak base learner assumption'],
    useCases: 'Face detection, object recognition, medical diagnosis.',
    hyperparameters: ['n_estimators', 'learning_rate'],
    implemented: true,
  },
  {
    id: 'xgboost',
    name: 'XGBoost Classifier',
    group: 'Classification',
    shortDef: 'Optimised gradient-boosted decision trees for classification.',
    howItWorks: 'Uses second-order gradients and regularisation for fast, accurate boosted tree construction.',
    advantages: ['State-of-the-art accuracy', 'Handles missing values', 'Built-in regularisation'],
    limitations: ['Many hyperparameters', 'Slower than LightGBM', 'Complex to tune'],
    useCases: 'Kaggle competitions, fraud detection, churn prediction.',
    hyperparameters: ['n_estimators', 'learning_rate', 'max_depth', 'reg_alpha'],
    implemented: true,
  },
  {
    id: 'lightgbm',
    name: 'LightGBM Classifier',
    group: 'Classification',
    shortDef: 'Efficient gradient-boosting with leaf-wise tree growth for classification.',
    howItWorks: 'Grows leaves with maximum loss reduction first; uses histogram binning for speed.',
    advantages: ['Very fast', 'Low memory', 'High accuracy on large datasets'],
    limitations: ['Prone to overfitting on small data', 'Many hyperparameters', 'Less interpretable'],
    useCases: 'Large-scale classification, recommendation, industry ML.',
    hyperparameters: ['n_estimators', 'num_leaves', 'learning_rate'],
    implemented: true,
  },
  {
    id: 'catboost',
    name: 'CatBoost Classifier',
    group: 'Classification',
    shortDef: 'Gradient boosting with strong categorical-feature support.',
    howItWorks: 'Uses ordered boosting and symmetric trees to handle categorical features without preprocessing.',
    advantages: ['Handles categoricals natively', 'Less tuning required', 'Competitive accuracy'],
    limitations: ['Slow on CPU', 'Large model size', 'Smaller community'],
    useCases: 'E-commerce, banking, recommendation systems.',
    hyperparameters: ['iterations', 'learning_rate', 'depth'],
    implemented: true,
  },
  {
    id: 'extra_trees',
    name: 'Extra Trees Classifier',
    group: 'Classification',
    shortDef: 'Extremely randomised trees that split on random thresholds per feature.',
    howItWorks: 'Unlike Random Forest, splits both feature and threshold are chosen randomly, reducing variance further.',
    advantages: ['Faster than Random Forest', 'Low variance', 'Good generalisation'],
    limitations: ['Higher bias than RF', 'Less interpretable', 'May underperform on small datasets'],
    useCases: 'High-dimensional classification, text, genomics.',
    hyperparameters: ['n_estimators', 'max_depth', 'min_samples_split'],
    implemented: true,
  },
  {
    id: 'lda',
    name: 'Linear Discriminant Analysis (LDA)',
    group: 'Classification',
    shortDef: 'Separates classes using a linear statistical approach.',
    howItWorks: 'Projects data onto axes that maximise between-class variance and minimise within-class variance.',
    advantages: ['Interpretable', 'Dimensionality reduction', 'Works well when Gaussian assumption holds'],
    limitations: ['Assumes Gaussian distributions', 'Linear boundary only', 'Sensitive to outliers'],
    useCases: 'Face recognition, medical classification, dimensionality reduction.',
    hyperparameters: ['solver', 'n_components'],
    implemented: true,
  },
  {
    id: 'qda',
    name: 'Quadratic Discriminant Analysis (QDA)',
    group: 'Classification',
    shortDef: 'Classifies using quadratic decision boundaries.',
    howItWorks: 'Allows each class its own covariance matrix, enabling curved (quadratic) class boundaries.',
    advantages: ['More flexible than LDA', 'No shared-covariance assumption', 'Probabilistic'],
    limitations: ['More parameters', 'Can overfit with few samples', 'Assumes Gaussian'],
    useCases: 'Multi-class classification, bioinformatics, pattern recognition.',
    hyperparameters: ['reg_param'],
    implemented: true,
  },
  {
    id: 'perceptron',
    name: 'Perceptron',
    group: 'Classification',
    shortDef: 'A basic linear classification algorithm inspired by a single neuron.',
    howItWorks: 'Iteratively updates weights when a misclassification occurs; converges when data is linearly separable.',
    advantages: ['Very fast', 'Simple', 'Online learning'],
    limitations: ['Linear boundary only', 'No convergence guarantee if not linearly separable', 'Brittle'],
    useCases: 'Binary classification, baseline models, online learning.',
    hyperparameters: ['max_iter', 'eta0', 'penalty'],
    implemented: true,
  },
  {
    id: 'passive_aggressive',
    name: 'Passive-Aggressive Classifier',
    group: 'Classification',
    shortDef: 'Learns efficiently from streaming examples with a max-margin update rule.',
    howItWorks: 'Stays passive on correctly classified samples; aggressively updates weights on mistakes.',
    advantages: ['Online learning', 'Fast', 'No learning rate needed'],
    limitations: ['Sensitive to outliers', 'Linear only', 'Not probabilistic'],
    useCases: 'Text streams, fraud detection, online learning pipelines.',
    hyperparameters: ['C', 'max_iter'],
    implemented: true,
  },
  {
    id: 'sgd',
    name: 'SGD Classifier',
    group: 'Classification',
    shortDef: 'Trains linear classifiers using stochastic gradient descent.',
    howItWorks: 'Updates model weights using one (or a mini-batch of) sample(s) at a time, minimising chosen loss.',
    advantages: ['Scalable to very large datasets', 'Flexible loss function', 'Online learning'],
    limitations: ['Requires careful learning-rate scheduling', 'Needs scaling', 'Noisy updates'],
    useCases: 'Large-scale text classification, online learning, NLP.',
    hyperparameters: ['loss', 'alpha', 'max_iter', 'learning_rate'],
    implemented: true,
  },
  {
    id: 'mlp',
    name: 'MLP Classifier',
    group: 'Classification',
    shortDef: 'Multi-Layer Perceptron — a feedforward neural network classifier.',
    howItWorks: 'Stacks fully connected layers with nonlinear activations; trained via backpropagation with gradient descent.',
    advantages: ['Learns complex nonlinear patterns', 'Flexible architecture', 'Works across many domains'],
    limitations: ['Requires scaling', 'Many hyperparameters', 'Slow to train without GPU'],
    useCases: 'Image classification, tabular data, NLP with embeddings.',
    hyperparameters: ['hidden_layer_sizes', 'activation', 'alpha', 'learning_rate'],
    implemented: true,
  },
];

const getAlgorithmVisuals = (id: string, group: string) => {
  if (id.includes('forest') || id.includes('extra_trees') || id.includes('decision_tree')) {
    return {
      icon: GitBranch,
      familyTag: 'Tree Ensemble',
      badgeColor: 'from-emerald-500/25 to-teal-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      accentGlow: 'hover:border-emerald-500/40 hover:shadow-[0_12px_32px_-8px_rgba(16,185,129,0.22)]'
    };
  }
  if (id.includes('xgboost') || id.includes('lightgbm') || id.includes('catboost') || id.includes('gradient_boosting') || id.includes('adaboost')) {
    return {
      icon: Zap,
      familyTag: 'Gradient Boosting',
      badgeColor: 'from-amber-500/25 to-orange-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      accentGlow: 'hover:border-amber-500/40 hover:shadow-[0_12px_32px_-8px_rgba(245,158,11,0.22)]'
    };
  }
  if (id.includes('mlp') || id.includes('neural')) {
    return {
      icon: Cpu,
      familyTag: 'Deep Neural Net',
      badgeColor: 'from-pink-500/25 to-rose-500/15 text-pink-300 border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.15)]',
      iconBg: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
      accentGlow: 'hover:border-pink-500/40 hover:shadow-[0_12px_32px_-8px_rgba(236,72,153,0.22)]'
    };
  }
  if (id.includes('svm') || id.includes('svc') || id.includes('svr')) {
    return {
      icon: Target,
      familyTag: 'Kernel Machine',
      badgeColor: 'from-violet-500/25 to-indigo-500/15 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.15)]',
      iconBg: 'bg-violet-500/15 border-violet-500/30 text-violet-400',
      accentGlow: 'hover:border-violet-500/40 hover:shadow-[0_12px_32px_-8px_rgba(139,92,246,0.22)]'
    };
  }
  if (id.includes('knn')) {
    return {
      icon: Compass,
      familyTag: 'Distance Proximity',
      badgeColor: 'from-cyan-500/25 to-blue-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      accentGlow: 'hover:border-cyan-500/40 hover:shadow-[0_12px_32px_-8px_rgba(6,182,212,0.22)]'
    };
  }
  if (id.includes('bayes')) {
    return {
      icon: Binary,
      familyTag: 'Bayesian / Probabilistic',
      badgeColor: 'from-indigo-500/25 to-purple-500/15 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.15)]',
      iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
      accentGlow: 'hover:border-indigo-500/40 hover:shadow-[0_12px_32px_-8px_rgba(99,102,241,0.22)]'
    };
  }
  return {
    icon: group === 'Regression' ? TrendingUp : Activity,
    familyTag: group === 'Regression' ? 'Linear & Parametric' : 'Generalized Linear',
    badgeColor: group === 'Regression'
      ? 'from-violet-500/25 to-purple-500/15 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
      : 'from-cyan-500/25 to-teal-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
    iconBg: group === 'Regression' ? 'bg-violet-500/15 border-violet-500/30 text-violet-400' : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    accentGlow: group === 'Regression'
      ? 'hover:border-violet-500/40 hover:shadow-[0_12px_32px_-8px_rgba(139,92,246,0.22)]'
      : 'hover:border-cyan-500/40 hover:shadow-[0_12px_32px_-8px_rgba(6,182,212,0.22)]'
  };
};

const CategoryBadge: React.FC<{ group: 'Regression' | 'Classification' }> = ({ group }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${
      group === 'Regression'
        ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/15 text-violet-300 border-violet-500/40'
        : 'bg-gradient-to-r from-cyan-500/20 to-teal-500/15 text-cyan-300 border-cyan-500/40'
    }`}
  >
    {group}
  </span>
);

const AlgorithmCard: React.FC<{
  alg: AlgorithmItem;
  onTrain: (alg: AlgorithmItem) => void;
  onLearn: (alg: AlgorithmItem) => void;
}> = ({ alg, onTrain, onLearn }) => {
  const [expanded, setExpanded] = useState(false);
  const visuals = getAlgorithmVisuals(alg.id, alg.group);
  const IconComp = visuals.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.05] via-[#0d1020]/90 to-[#090b16] border border-white/[0.08] backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between ${visuals.accentGlow} hover:-translate-y-1 shadow-xl`}>
      {/* Top subtle ambient glow streak */}
      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${alg.group === 'Regression' ? 'from-violet-500/70 via-fuchsia-500/40 to-transparent' : 'from-cyan-400/70 via-emerald-400/40 to-transparent'} opacity-60 group-hover:opacity-100 transition-opacity`} />
      
      <div className="p-5 space-y-4">
        {/* Header Row: Icon + Badge + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${visuals.iconBg}`}>
              <IconComp size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CategoryBadge group={alg.group} />
                <span className="text-[10px] font-mono text-slate-400 tracking-tight">
                  {visuals.familyTag}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span>Live</span>
            </span>
          </div>
        </div>

        {/* Title and Short Def */}
        <div>
          <h3 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors tracking-tight">
            {alg.name}
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
            {alg.shortDef}
          </p>
        </div>

        {/* Hyperparameters Preview Chips */}
        {alg.hyperparameters && alg.hyperparameters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            {alg.hyperparameters.slice(0, 3).map((hp, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400">
                {hp}
              </span>
            ))}
            {alg.hyperparameters.length > 3 && (
              <span className="text-[10px] font-mono text-slate-500 px-1">
                +{alg.hyperparameters.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Expandable details drawer */}
        {expanded && (
          <div className="pt-3 border-t border-white/[0.07] space-y-3 text-xs animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] font-mono text-violet-300 uppercase tracking-widest font-semibold block mb-1">
                Mathematical Mechanism
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {alg.howItWorks}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                  Key Advantages
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {alg.advantages.map((adv, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block mb-1">
                  Limitations
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {alg.limitations.map((lim, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-rose-400 font-bold">✗</span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-xl text-[11px]">
              <span className="text-[10px] font-mono text-cyan-300 font-semibold block mb-0.5">Recommended Applications:</span>
              <span className="text-slate-300">{alg.useCases}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls: Train + Learn + Details toggle */}
      <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-2 border-t border-white/[0.05] bg-black/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTrain(alg)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_22px_rgba(6,182,212,0.45)] transition-all cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <Play size={11} className="fill-white" />
            <span>Train Model</span>
          </button>

          <button
            onClick={() => onLearn(alg)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen size={11} className="text-slate-400" />
            <span>Learn More</span>
          </button>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 rounded-lg hover:bg-white/5"
          title={expanded ? "Show less" : "Show mathematical details"}
        >
          <span className="text-[11px] font-mono hidden sm:inline">{expanded ? "Less" : "Details"}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    </div>
  );
};

export const AlgorithmUniversePage: React.FC<AlgorithmUniverseProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'All' | 'Regression' | 'Classification'>('All');
  
  // Datasets & Interactive Modal state
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [trainingAlgo, setTrainingAlgo] = useState<AlgorithmItem | null>(null);
  const [learningAlgo, setLearningAlgo] = useState<AlgorithmItem | null>(null);

  // Training parameters
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('wine_combined');
  const [splitRatio, setSplitRatio] = useState<number>(0.3);
  const [scaleFeatures, setScaleFeatures] = useState<boolean>(false);
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(false);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainedResult, setTrainedResult] = useState<ModelMetricsResponse | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets().then(list => {
      setDatasets(list);
      const combined = list.find(d => d.id === 'wine_combined');
      if (combined) {
        setSelectedDatasetId('wine_combined');
      } else if (list.length > 0) {
        setSelectedDatasetId(list[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleOpenTrainModal = (alg: AlgorithmItem) => {
    setTrainingAlgo(alg);
    setTrainedResult(null);
    setTrainError(null);
    
    // Auto-select sensible feature scaling by algorithm family
    const needsScale = [
      'knn', 'svm', 'svr', 'logistic', 'linear', 'ridge', 'lasso', 'elastic',
      'mlp', 'sgd', 'perceptron', 'passive_aggressive', 'bayesian', 'gaussian_process'
    ].some(k => alg.id.includes(k));
    setScaleFeatures(needsScale);
  };

  const handleExecuteTraining = async () => {
    if (!trainingAlgo) return;
    setIsTraining(true);
    setTrainError(null);

    const activeDs = datasets.find(d => d.id === selectedDatasetId);
    const dsName = activeDs ? activeDs.name : selectedDatasetId;

    try {
      const res = await trainModel({
        dataset_id: selectedDatasetId,
        algorithm: trainingAlgo.id,
        task_type: trainingAlgo.group.toLowerCase(),
        target_column: 'quality',
        test_size: splitRatio,
        random_state: 42,
        scale_features: scaleFeatures,
        remove_duplicates: removeDuplicates,
        hyperparameters: {},
        experiment_name: `${trainingAlgo.name} on ${dsName}`
      });
      setTrainedResult(res);
    } catch (e: any) {
      setTrainError(e.message || 'Model training failed.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleExportJSON = () => {
    if (!trainedResult) return;
    const blob = new Blob([JSON.stringify(trainedResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${trainedResult.algorithm}_${trainedResult.model_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = ALL_ALGORITHMS.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.shortDef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGroup = selectedGroup === 'All' || a.group === selectedGroup;
    return matchSearch && matchGroup;
  });

  const regression = filtered.filter((a) => a.group === 'Regression');
  const classification = filtered.filter((a) => a.group === 'Classification');

  return (
    <div className="space-y-10 p-2 sm:p-4 max-w-7xl mx-auto">
      {/* ───────────────────────── 1. HERO BANNER ───────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/40 via-[#0e1224] to-cyan-950/30 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-300">
              <Sparkles size={13} className="text-cyan-400" />
              <span>Computational Core • 37 ML Engines</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white">
              Algorithm{' '}
              <span className="text-gradient-violet-cyan">
                Universe
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
              A comprehensive laboratory of <strong className="text-white font-semibold">{ALL_ALGORITHMS.length} machine learning architectures</strong>. From classical parametric regression to deep neural multi-layer perceptrons, train on live datasets with zero latency.
            </p>
          </div>

          {/* Quick Counter Chips */}
          <div className="flex flex-row lg:flex-col gap-2.5 shrink-0">
            <div className="flex-1 lg:w-48 p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Regression</div>
                  <div className="text-xs font-mono text-slate-300">Continuous</div>
                </div>
              </div>
              <span className="font-tech text-lg font-bold text-violet-300">
                {ALL_ALGORITHMS.filter((a) => a.group === 'Regression').length}
              </span>
            </div>

            <div className="flex-1 lg:w-48 p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Classification</div>
                  <div className="text-xs font-mono text-slate-300">Discrete/Multi</div>
                </div>
              </div>
              <span className="font-tech text-lg font-bold text-cyan-300">
                {ALL_ALGORITHMS.filter((a) => a.group === 'Classification').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────── 2. SEARCH & GROUP CONTROLS ───────────────────────── */}
      <div className="p-2 sm:p-3 rounded-2xl bg-[#0c0f1d]/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center shadow-lg">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search 37 algorithms by name, mechanism, or hyperparameters (e.g. 'xgboost', 'trees', 'svm')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border border-white/10 focus:border-cyan-400/50 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Group Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 shrink-0">
          {(['All', 'Regression', 'Classification'] as const).map((g) => {
            const count = g === 'All' ? ALL_ALGORITHMS.length : ALL_ALGORITHMS.filter((a) => a.group === g).length;
            const active = selectedGroup === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{g}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────── 3. STATS TELEMETRY BAR ───────────────────────── */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <span>
            Displaying <strong className="text-white font-mono">{filtered.length}</strong> of {ALL_ALGORITHMS.length} models
          </span>
          {searchQuery && (
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              Filter: "{searchQuery}"
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span>Click <strong className="text-violet-400">Train Model</strong> to run interactive test pipeline</span>
        </div>
      </div>

      {/* ───────────────────────── 4. REGRESSION SECTION ───────────────────────── */}
      {regression.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-violet-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-inner">
                <TrendingUp size={16} />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <span>Part A — Regression Architectures</span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {regression.length} Algorithms
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Continuous target prediction evaluated via R², Mean Absolute Error (MAE), and Root Mean Squared Error (RMSE)
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {regression.map((a) => (
              <AlgorithmCard
                key={a.id}
                alg={a}
                onTrain={handleOpenTrainModal}
                onLearn={setLearningAlgo}
              />
            ))}
          </div>
        </section>
      )}

      {/* ───────────────────────── 5. CLASSIFICATION SECTION ───────────────────────── */}
      {classification.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <Activity size={16} />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <span>Part B — Classification Architectures</span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {classification.length} Algorithms
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Discrete class prediction evaluated via Accuracy, F1-Macro, Precision, Recall, and Confusion Matrices
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classification.map((a) => (
              <AlgorithmCard
                key={a.id}
                alg={a}
                onTrain={handleOpenTrainModal}
                onLearn={setLearningAlgo}
              />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400 bg-white/[0.02] border border-white/5 rounded-3xl">
          <p className="text-lg font-display text-white mb-2">No algorithms match your search.</p>
          <p className="text-xs text-slate-400">Try a different keyword or reset the filter group.</p>
        </div>
      )}

      {/* ───────────────────────── INTERACTIVE TRAINING MODAL ───────────────────────── */}
      {trainingAlgo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#0b0e1d]/95 border border-violet-500/40 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl shadow-violet-950/70 ring-1 ring-white/10">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <CategoryBadge group={trainingAlgo.group} />
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Interactive Training Pipeline
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">{trainingAlgo.name}</h2>
                <p className="text-xs text-slate-300 mt-1">{trainingAlgo.shortDef}</p>
              </div>
              <button
                onClick={() => setTrainingAlgo(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {trainError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                <XCircle size={16} className="text-rose-400 shrink-0" />
                <span>{trainError}</span>
              </div>
            )}

            {/* Pipeline Configuration Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/10">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5 font-medium">Choose Dataset:</label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                  className="w-full bg-[#080911] border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono font-bold cursor-pointer transition-colors shadow-inner"
                >
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.total_rows.toLocaleString()} rows)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5 font-medium">Train/Test Split:</label>
                <select
                  value={splitRatio}
                  onChange={(e) => setSplitRatio(Number(e.target.value))}
                  className="w-full bg-[#080911] border border-white/15 focus:border-violet-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono cursor-pointer transition-colors shadow-inner"
                >
                  <option value={0.3}>70% Train / 30% Test (Standard)</option>
                  <option value={0.2}>80% Train / 20% Test</option>
                  <option value={0.25}>75% Train / 25% Test</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={scaleFeatures}
                    onChange={(e) => setScaleFeatures(e.target.checked)}
                    className="accent-cyan-400 rounded cursor-pointer w-4 h-4"
                  />
                  <span>StandardScaler (Leak-free on Train only)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={removeDuplicates}
                    onChange={(e) => setRemoveDuplicates(e.target.checked)}
                    className="accent-violet-500 rounded cursor-pointer w-4 h-4"
                  />
                  <span>Drop Duplicate Rows</span>
                </label>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteTraining}
              disabled={isTraining}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.4)] cursor-pointer disabled:opacity-50 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isTraining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Training {trainingAlgo.name}...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-cyan-300 fill-cyan-300" />
                  <span>Execute Model Pipeline & Evaluate</span>
                </>
              )}
            </button>

            {/* Live Evaluation Results */}
            {trainedResult && (
              <div className="bg-white/[0.02] p-5 rounded-2xl border border-emerald-500/40 space-y-5 animate-in fade-in duration-300">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Evaluation Ready ({trainedResult.training_time_ms}ms)
                    </span>
                    <h3 className="font-display text-lg font-bold text-white mt-0.5">
                      {trainedResult.algorithm_name} on {trainedResult.dataset_name}
                    </h3>
                  </div>

                  <button
                    onClick={handleExportJSON}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-cyan-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download size={13} />
                    <span>Export JSON</span>
                  </button>
                </div>

                {/* Metrics Cards */}
                {trainedResult.classification_metrics ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#080911] p-3.5 rounded-xl border border-cyan-500/30">
                      <span className="text-slate-400 block text-[11px] font-mono">Accuracy</span>
                      <strong className="text-cyan-400 text-2xl font-tech font-bold">
                        {(trainedResult.classification_metrics.accuracy * 100).toFixed(2)}%
                      </strong>
                    </div>
                    <div className="bg-[#080911] p-3.5 rounded-xl border border-violet-500/30">
                      <span className="text-slate-400 block text-[11px] font-mono">F1 Macro</span>
                      <strong className="text-violet-400 text-2xl font-tech font-bold">
                        {trainedResult.classification_metrics.f1_macro.toFixed(3)}
                      </strong>
                    </div>
                    <div className="bg-[#080911] p-3.5 rounded-xl border border-emerald-500/30">
                      <span className="text-slate-400 block text-[11px] font-mono">Precision (W)</span>
                      <strong className="text-emerald-400 text-2xl font-tech font-bold">
                        {(trainedResult.classification_metrics.precision_weighted * 100).toFixed(1)}%
                      </strong>
                    </div>
                    <div className="bg-[#080911] p-3.5 rounded-xl border border-rose-500/30">
                      <span className="text-slate-400 block text-[11px] font-mono">Recall (W)</span>
                      <strong className="text-rose-400 text-2xl font-tech font-bold">
                        {(trainedResult.classification_metrics.recall_weighted * 100).toFixed(1)}%
                      </strong>
                    </div>
                  </div>
                ) : trainedResult.regression_metrics ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#080911] p-3.5 rounded-xl border border-cyan-500/30">
                      <span className="text-slate-400 block text-[11px] font-mono">R² Score</span>
                      <strong className="text-cyan-400 text-2xl font-tech font-bold">
                        {trainedResult.regression_metrics.r2_score.toFixed(3)}
                      </strong>
                    </div>
                    <div className="bg-[#080911] p-3.5 rounded-xl border border-violet-500/30">
                      <span className="text-slate-400 block text-[11px] font-mono">MAE</span>
                      <strong className="text-violet-400 text-2xl font-tech font-bold">
                        {trainedResult.regression_metrics.mae.toFixed(3)}
                      </strong>
                    </div>
                    <div className="bg-[#080911] p-3.5 rounded-xl border border-emerald-500/30">
                      <span className="text-slate-400 block text-[11px] font-mono">RMSE</span>
                      <strong className="text-emerald-400 text-2xl font-tech font-bold">
                        {trainedResult.regression_metrics.rmse.toFixed(3)}
                      </strong>
                    </div>
                    <div className="bg-[#080911] p-3.5 rounded-xl border border-rose-500/30">
                      <span className="text-slate-400 block text-[11px] font-mono">MSE</span>
                      <strong className="text-rose-400 text-2xl font-tech font-bold">
                        {trainedResult.regression_metrics.mse.toFixed(3)}
                      </strong>
                    </div>
                  </div>
                ) : null}

                {/* Confusion Matrix Chart */}
                {trainedResult.classification_metrics && (
                  <div className="pt-2">
                    <ConfusionMatrixChart
                      matrix={trainedResult.classification_metrics.confusion_matrix}
                      labels={trainedResult.classification_metrics.labels}
                    />
                  </div>
                )}

                {/* Feature Importances Chart */}
                {trainedResult.feature_importances && trainedResult.feature_importances.length > 0 && (
                  <div className="pt-2">
                    <FeatureImportanceChart importances={trainedResult.feature_importances} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────── LEARN MORE MODAL ───────────────────────── */}
      {learningAlgo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#0b0e1d]/95 border border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-950/70 ring-1 ring-white/10">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <CategoryBadge group={learningAlgo.group} />
                <h2 className="font-display text-2xl font-bold text-white mt-1.5">{learningAlgo.name}</h2>
                <span className="text-xs text-slate-400 font-mono">Theoretical & Algorithmic Blueprint</span>
              </div>
              <button
                onClick={() => setLearningAlgo(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 space-y-1.5">
                <span className="text-cyan-400 font-mono font-bold uppercase tracking-wider block">Mathematical Foundation:</span>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">{learningAlgo.howItWorks}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                  <span className="text-emerald-400 font-mono font-bold uppercase tracking-wider block">Key Advantages:</span>
                  <ul className="space-y-1.5">
                    {learningAlgo.advantages.map((adv, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-1.5 font-sans">
                        <span className="text-emerald-400 font-bold">+</span> {adv}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20 space-y-2">
                  <span className="text-rose-400 font-mono font-bold uppercase tracking-wider block">Key Limitations:</span>
                  <ul className="space-y-1.5">
                    {learningAlgo.limitations.map((lim, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-1.5 font-sans">
                        <span className="text-rose-400 font-bold">−</span> {lim}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 space-y-1.5">
                <span className="text-violet-400 font-mono font-bold uppercase tracking-wider block">Recommended Applications:</span>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">{learningAlgo.useCases}</p>
              </div>

              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-amber-400 font-mono font-bold uppercase tracking-wider block">Hyperparameter Tuning Guide:</span>
                <div className="flex flex-wrap gap-2">
                  {learningAlgo.hyperparameters.map((hp, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-lg text-slate-200 font-mono">
                      {hp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  const alg = learningAlgo;
                  setLearningAlgo(null);
                  handleOpenTrainModal(alg);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-600/30 transition-all hover:scale-105"
              >
                <Play size={12} className="fill-white" /> Train This Algorithm Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmUniversePage;

