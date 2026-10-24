# Wine Quality Datasets (Red, White & Combined)

This folder contains the complete physicochemical wine quality benchmark datasets used by **NeuroML Studio** and the **Google Colab Random Forest vs KNN Pipeline**.

---

## 📁 Dataset Files

| Filename | Samples | Features | Target Column | Description |
| :--- | :--- | :--- | :--- | :--- |
| [`winequality-white.csv`](winequality-white.csv) | **4,898** | 11 physicochemical + 1 target | `quality` (3–9) | White wine variant from Vinho Verde region. |
| [`winequality-red.csv`](winequality-red.csv) | **1,599** | 11 physicochemical + 1 target | `quality` (3–8) | Red wine variant from Vinho Verde region. |
| [`winequality-combined.csv`](winequality-combined.csv) | **6,497** | 11 physicochemical + 1 target | `quality` (3–9) | Unified dataset combining White and Red wines. |

---

## 🔬 Feature Dictionary (11 Physicochemical Inputs)

1. **`fixed acidity`** ($g(tartaric\ acid)/dm^3$): Most acids involved with wine or fixed or nonvolatile (do not evaporate readily).
2. **`volatile acidity`** ($g(acetic\ acid)/dm^3$): The amount of acetic acid in wine, which at too high of levels can lead to an unpleasant, vinegar taste.
3. **`citric acid`** ($g/dm^3$): Found in small quantities, citric acid can add 'freshness' and flavor to wines.
4. **`residual sugar`** ($g/dm^3$): The amount of sugar remaining after fermentation stops; wines >45g/l are considered sweet.
5. **`chlorides`** ($g(sodium\ chloride)/dm^3$): The amount of salt in the wine.
6. **`free sulfur dioxide`** ($mg/dm^3$): The free form of SO2 exists in equilibrium between molecular SO2 and bisulfite ion; prevents microbial growth and oxidation.
7. **`total sulfur dioxide`** ($mg/dm^3$): Amount of free and bound forms of S02; detectable in nose and taste at concentrations >50 ppm.
8. **`density`** ($g/cm^3$): Density is close to that of water depending on percent alcohol and sugar content.
9. **`pH`**: Describes how acidic or basic a wine is on a scale from 0 (very acidic) to 14 (very basic); most wines are between 3–4.
10. **`sulphates`** ($g(potassium\ sulphate)/dm^3$): Wine additive which can contribute to sulfur dioxide levels acting as antimicrobial and antioxidant.
11. **`alcohol`** (% vol): Percent alcohol content of the wine.

---

## 🎯 Target Variable: `quality`

* **Discrete Scale**: Integers from 0 to 10 (ratings in dataset range from 3 to 9).
* **3-Tier Classification Mapping (Colab Project Standard)**:
  * 🔴 **Low Quality (≤ 4)**: Scores 3, 4
  * 🟡 **Medium Quality (5–6)**: Scores 5, 6 (~75% of samples)
  * 🟢 **High Quality (≥ 7)**: Scores 7, 8, 9
* **Binary Classification Mapping**:
  * `0`: Low / Normal Quality (`< 6`)
  * `1`: High / Good Quality (`≥ 6`)
