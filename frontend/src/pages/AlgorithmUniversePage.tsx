import React, { useState } from 'react';
import { Search, Play, BookOpen, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface AlgorithmUniverseProps {
  onTrainModel: (algorithmId: string) => void;
  onLearnMore: (algorithmId: string) => void;
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

const CategoryBadge: React.FC<{ group: 'Regression' | 'Classification' }> = ({ group }) => (
  <span
    className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
      group === 'Regression'
        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
    }`}
  >
    {group}
  </span>
);

const AlgorithmCard: React.FC<{
  alg: AlgorithmItem;
  onTrain: (id: string) => void;
  onLearn: (id: string) => void;
}> = ({ alg, onTrain, onLearn }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel rounded-xl border border-white/10 hover:border-violet-500/40 transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <CategoryBadge group={alg.group} />
            {alg.implemented ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 size={11} /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <XCircle size={11} /> Planned
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm leading-tight">{alg.name}</h3>
          <p className="text-white/50 text-xs mt-1 leading-relaxed line-clamp-2">{alg.shortDef}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/30 hover:text-violet-400 transition-colors mt-1 flex-shrink-0"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <div>
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-1">How It Works</p>
            <p className="text-white/60 text-xs leading-relaxed">{alg.howItWorks}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Advantages</p>
              <ul className="space-y-0.5">
                {alg.advantages.map((a, i) => (
                  <li key={i} className="text-white/55 text-xs flex items-start gap-1">
                    <span className="text-emerald-500 mt-0.5">+</span> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">Limitations</p>
              <ul className="space-y-0.5">
                {alg.limitations.map((l, i) => (
                  <li key={i} className="text-white/55 text-xs flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">−</span> {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-1">Use Cases</p>
            <p className="text-white/55 text-xs">{alg.useCases}</p>
          </div>
          <div>
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">Key Hyperparameters</p>
            <div className="flex flex-wrap gap-1.5">
              {alg.hyperparameters.map((hp, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white/60 font-mono">
                  {hp}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onTrain(alg.id)}
          disabled={!alg.implemented}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            alg.implemented
              ? 'bg-violet-600 hover:bg-violet-500 text-white'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          <Play size={11} /> Train Model
        </button>
        <button
          onClick={() => onLearn(alg.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10"
        >
          <BookOpen size={11} /> Learn More
        </button>
      </div>
    </div>
  );
};

export const AlgorithmUniversePage: React.FC<AlgorithmUniverseProps> = ({ onTrainModel, onLearnMore }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'All' | 'Regression' | 'Classification'>('All');

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
    <div className="space-y-8 p-1">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Algorithm Universe</h1>
        <p className="text-white/50">
          {ALL_ALGORITHMS.length} machine learning algorithms — {ALL_ALGORITHMS.filter((a) => a.group === 'Regression').length} Regression,{' '}
          {ALL_ALGORITHMS.filter((a) => a.group === 'Classification').length} Classification. All live and trainable.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Regression', 'Classification'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedGroup === g
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap text-sm text-white/50">
        <span>
          Showing <span className="text-white font-semibold">{filtered.length}</span> of {ALL_ALGORITHMS.length} algorithms
        </span>
        {regression.length > 0 && (
          <span className="text-violet-400">
            {regression.length} Regression
          </span>
        )}
        {classification.length > 0 && (
          <span className="text-cyan-400">
            {classification.length} Classification
          </span>
        )}
      </div>

      {/* Regression Section */}
      {regression.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-violet-500/20" />
            <h2 className="text-lg font-bold text-violet-300 px-2">
              A. Regression Models
              <span className="ml-2 text-sm font-normal text-violet-400/60">({regression.length})</span>
            </h2>
            <div className="h-px flex-1 bg-violet-500/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {regression.map((a) => (
              <AlgorithmCard key={a.id} alg={a} onTrain={onTrainModel} onLearn={onLearnMore} />
            ))}
          </div>
        </section>
      )}

      {/* Classification Section */}
      {classification.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-cyan-500/20" />
            <h2 className="text-lg font-bold text-cyan-300 px-2">
              B. Classification Models
              <span className="ml-2 text-sm font-normal text-cyan-400/60">({classification.length})</span>
            </h2>
            <div className="h-px flex-1 bg-cyan-500/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classification.map((a) => (
              <AlgorithmCard key={a.id} alg={a} onTrain={onTrainModel} onLearn={onLearnMore} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <p className="text-xl mb-2">No algorithms match your search.</p>
          <p className="text-sm">Try a different keyword or clear the filter.</p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmUniversePage;
