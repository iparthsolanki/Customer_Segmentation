# Customer Segmentation using RFM Analysis & K-Means

<p align="center">
  <img src="customer_segmentation.jpeg" alt="Customer Segmentation" width="1000">
</p>

<p align="center">
  <strong>RFM Analysis • K-Means Clustering • Machine Learning • FastAPI • Frontend • Deployment</strong>
</p>

<p align="center">
  An end-to-end customer segmentation system that converts retail transaction data into actionable customer segments.
</p>

---

## Live Demo

<p align="center">

<a href="https://customer-segmentation-1-zbxr.onrender.com/">
  <strong>View Live Customer Segmentation Application</strong>
</a>

</p>

---

## Overview

Customer Segmentation is an end-to-end Machine Learning project designed to understand customer purchasing behavior and divide customers into meaningful business segments.

The project starts with raw retail transaction data and transforms it into customer-level behavioral features using **RFM Analysis**:

- Recency
- Frequency
- Monetary

After feature engineering and preprocessing, **K-Means Clustering** is used to identify customer groups.

The trained Machine Learning pipeline is then integrated with a **FastAPI backend** and a custom frontend, allowing users to enter customer RFM values and receive:

- Predicted customer cluster
- Customer segment
- Business recommendation

The complete workflow covers data analysis, feature engineering, unsupervised learning, model evaluation, API development, frontend integration, and deployment.

---

# Business Problem

Retail companies have thousands of customers with different purchasing behaviors.

Some customers:

- Purchase frequently
- Spend a large amount
- Purchase recently

While others:

- Have not purchased for a long time
- Purchase only occasionally
- Generate lower revenue

Treating every customer in the same way can lead to inefficient marketing strategies.

A business needs to understand:

> **Who are my valuable customers, who is becoming inactive, and what strategy should be used for each customer group?**

This project solves that problem using customer transaction history and unsupervised Machine Learning.

---

# Project Objective

The main objectives of this project are:

- Analyze retail transaction data.
- Clean and preprocess transaction records.
- Handle missing Customer IDs.
- Handle cancelled and invalid transactions.
- Remove duplicate records.
- Calculate transaction revenue.
- Build customer-level RFM features.
- Analyze RFM distributions and skewness.
- Apply Log Transformation to highly skewed features.
- Scale features for clustering.
- Apply K-Means Clustering.
- Determine an appropriate number of clusters.
- Evaluate clusters using the Elbow Method and Silhouette Score.
- Profile each customer cluster.
- Convert clusters into meaningful business segments.
- Generate business recommendations.
- Save the complete ML pipeline.
- Build a FastAPI prediction API.
- Integrate the API with a frontend.
- Deploy the complete application online.

---

# Dataset

The project uses the **Online Retail II – UCI** dataset.

The dataset contains historical retail transaction information.

### Main Features

| Column | Description |
|---|---|
| `Invoice` | Invoice / transaction number |
| `StockCode` | Product identification code |
| `Description` | Product description |
| `Quantity` | Quantity purchased |
| `InvoiceDate` | Transaction date and time |
| `Price` | Product price |
| `Customer ID` | Unique customer identifier |
| `Country` | Customer country |

The original dataset contains transaction-level records.

For customer segmentation, these transactions are aggregated into customer-level behavioral features.

---

# Project Architecture

```text
                    RAW RETAIL DATA
                           |
                           v
                  Data Understanding
                           |
                           v
                    Data Cleaning
                           |
                           v
                Exploratory Data Analysis
                           |
                           v
                  Revenue Calculation
                           |
                           v
                 Customer Aggregation
                           |
                           v
                     RFM Analysis
                           |
              +------------+------------+
              |            |            |
              v            v            v
           Recency      Frequency    Monetary
              |            |            |
              +------------+------------+
                           |
                           v
                    Skewness Analysis
                           |
                           v
                   Log Transformation
                           |
                           v
                    Feature Scaling
                           |
                           v
                  K-Means Clustering
                           |
                           v
                   Cluster Evaluation
                           |
                           v
                 Customer Segmentation
                           |
                           v
              Business Recommendations
                           |
                           v
                  Saved ML Pipeline
                           |
                           v
                     FastAPI API
                           |
                           v
                     Frontend UI
                           |
                           v
                       Render
```

---

# Data Analysis & Preprocessing

## 1. Data Loading

The dataset is downloaded and loaded using Python and Pandas.

```python
data = pd.read_csv(filepath)

df = data.copy()
```

Initial analysis includes:

- Dataset shape
- Data types
- Missing values
- Duplicate records
- Numerical statistics
- Categorical statistics
- Unique customers
- Unique countries

---

## 2. Missing Customer IDs

Customer segmentation requires a valid customer identifier.

Therefore, transactions without a `Customer ID` are removed.

```python
df_clean = df.dropna(
    subset=["Customer ID"]
).copy()
```

---

## 3. Handling Negative Quantities

Negative quantities represent return/cancellation-related transactions.

For customer purchase behavior analysis, only positive quantities are retained.

```python
df_clean = df_clean[
    df_clean["Quantity"] > 0
].copy()
```

---

## 4. Handling Invalid Prices

Transactions with zero or invalid prices are removed.

```python
df_clean = df_clean[
    df_clean["Price"] > 0
].copy()
```

---

## 5. Removing Duplicates

Duplicate transaction records are identified and removed.

```python
df_clean = df_clean.drop_duplicates().copy()
```

---

# Revenue Calculation

A new `Revenue` feature is created.

```python
df_clean["Revenue"] = (
    df_clean["Quantity"] *
    df_clean["Price"]
)
```

### Formula

```text
Revenue = Quantity × Price
```

This feature is used to calculate the total monetary value generated by each customer.

---

# RFM Analysis

RFM is the core of this project.

```text
R → Recency
F → Frequency
M → Monetary
```

These three features provide a simple representation of customer purchasing behavior.

---

## Recency

Recency measures how many days have passed since the customer's last purchase.

The reference date is calculated from the latest transaction date:

```python
reference_date = (
    df_clean["InvoiceDate"].max()
    + pd.DateOffset(days=1)
)
```

Customer recency is then calculated as:

```python
customer_recency = (
    reference_date -
    customer_last_purchase
).dt.days
```

### Interpretation

```text
Lower Recency
      ↓
More recent customer activity

Higher Recency
      ↓
Customer has not purchased recently
```

---

## Frequency

Frequency represents the number of unique invoices/orders made by a customer.

```python
customer_frequency = (
    df_clean
    .groupby("Customer ID")["Invoice"]
    .nunique()
)
```

### Interpretation

```text
Higher Frequency
      ↓
Customer purchases more frequently

Lower Frequency
      ↓
Customer purchases less frequently
```

---

## Monetary

Monetary represents the total revenue generated by a customer.

```python
customer_revenue = (
    df_clean
    .groupby("Customer ID")["Revenue"]
    .sum()
)
```

### Interpretation

```text
Higher Monetary
      ↓
Higher customer spending

Lower Monetary
      ↓
Lower customer spending
```

---

# Customer-Level RFM Dataset

The three features are combined:

```python
rfm = pd.concat(
    [
        customer_recency,
        customer_frequency,
        customer_revenue
    ],
    axis=1
)

rfm.columns = [
    "Recency",
    "Frequency",
    "Monetary"
]
```

Final customer-level features:

| Feature | Meaning |
|---|---|
| Recency | Days since last purchase |
| Frequency | Number of unique orders |
| Monetary | Total customer revenue |

---

# Exploratory Data Analysis

EDA is performed to understand customer behavior before applying clustering.

The project analyzes:

- Descriptive statistics
- RFM distributions
- Feature skewness
- Recency distribution
- Frequency distribution
- Monetary distribution
- Recency vs Monetary
- Frequency vs Monetary
- 3D customer behavior

---

# Skewness Analysis

The RFM features are checked for skewness:

```python
rfm.skew()
```

Retail customer data often contains a small number of customers with extremely high spending or purchasing frequency.

Therefore, the distribution of `Frequency` and `Monetary` can be highly skewed.

---

# Log Transformation

To reduce the effect of extreme values, Log Transformation is applied to:

```text
Frequency
Monetary
```

using:

```python
FunctionTransformer(np.log1p)
```

The transformation is included inside the Machine Learning preprocessing pipeline.

```text
Frequency
    ↓
Log Transformation

Monetary
    ↓
Log Transformation
```

---

# Feature Scaling

After transformation, the features are standardized using:

```python
StandardScaler()
```

Scaling is important because RFM features can have very different numerical ranges.

The clustering pipeline therefore follows:

```text
RFM Features
      ↓
Log Transformation
      ↓
StandardScaler
      ↓
K-Means
```

---

# Unsupervised Machine Learning

Since customer segment labels are not available beforehand, this project uses **Unsupervised Learning**.

The main algorithm is:

# K-Means Clustering

K-Means groups customers based on similarity in their RFM behavior.

Each customer is assigned to a cluster.

```text
Customer RFM Data
       ↓
K-Means
       ↓
Cluster 0
Cluster 1
Cluster 2
```

---

# K-Means Configuration

The final pipeline uses:

```python
KMeans(
    n_clusters=3,
    random_state=42,
    n_init=10
)
```

### Parameters

| Parameter | Value |
|---|---|
| Algorithm | K-Means |
| Number of Clusters | 3 |
| Random State | 42 |
| N Init | 10 |

---

# Selecting Number of Clusters

Two major techniques are used to analyze the appropriate number of clusters.

## Elbow Method

The Elbow Method evaluates K-Means inertia for:

```text
K = 1 to 10
```

The inertia values are plotted against the number of clusters to understand how the clustering structure changes as K increases.

---

## Silhouette Score

Silhouette Score is calculated for:

```text
K = 2 to 10
```

Actual notebook results:

| K | Silhouette Score |
|---:|---:|
| 2 | 0.4187 |
| 3 | 0.4010 |
| 4 | 0.3616 |
| 5 | 0.3664 |
| 6 | 0.3469 |
| 7 | 0.3353 |
| 8 | 0.3155 |
| 9 | 0.3093 |
| 10 | 0.2954 |

The final project uses **3 clusters** based on the clustering analysis and business segmentation design.

---

# Final Customer Segments

The final K-Means clusters are mapped to business-friendly customer segments.

```text
Cluster 0
    ↓
Inactive / Lost

Cluster 1
    ↓
High-Value / Loyal

Cluster 2
    ↓
Regular / Low-Value
```

---

# Cluster Profile

The final notebook produces the following customer-level cluster summary:

| Cluster | Customers | Avg. Recency | Avg. Frequency | Avg. Monetary |
|---:|---:|---:|---:|---:|
| 0 | 1,840 | 472.95 | 1.79 | 555.30 |
| 1 | 1,675 | 57.29 | 15.95 | 8,561.95 |
| 2 | 2,363 | 91.94 | 2.94 | 851.37 |

---

# Segment 01 — Inactive / Lost

### Cluster

```text
Cluster 0
```

### Customer Profile

Average values:

```text
Recency   : 472.95 days
Frequency : 1.79 orders
Monetary  : 555.30
```

These customers have relatively high recency and low purchase activity.

### Business Strategy

Recommended actions include:

- Reactivation campaigns
- Win-back offers
- Special discounts
- Personalized offers
- Retention campaigns

### Business Objective

Encourage inactive customers to return and make new purchases.

---

# Segment 02 — High-Value / Loyal

### Cluster

```text
Cluster 1
```

### Customer Profile

Average values:

```text
Recency   : 57.29 days
Frequency : 15.95 orders
Monetary  : 8,561.95
```

These customers show strong purchasing activity and high customer value.

### Business Strategy

Recommended actions include:

- Loyalty rewards
- Exclusive offers
- Premium customer benefits
- VIP programs
- Early access to offers

### Business Objective

Maintain customer loyalty and strengthen long-term customer relationships.

---

# Segment 03 — Regular / Low-Value

### Cluster

```text
Cluster 2
```

### Customer Profile

Average values:

```text
Recency   : 91.94 days
Frequency : 2.94 orders
Monetary  : 851.37
```

These customers show regular activity but comparatively lower purchase frequency and monetary value.

### Business Strategy

Recommended actions include:

- Personalized recommendations
- Cross-selling
- Targeted promotions
- Product recommendations
- Purchase frequency campaigns

### Business Objective

Increase engagement, purchase frequency, and customer value.

---

# Customer Segmentation Visualizations

The project includes multiple visualizations for understanding the resulting clusters.

## Recency vs Monetary

```text
X-axis → Recency
Y-axis → Monetary
Color → Customer Cluster
```

This visualization helps understand how recent customer activity relates to total spending.

---

## Frequency vs Monetary

```text
X-axis → Frequency
Y-axis → Monetary
Color → Customer Cluster
```

This visualization helps identify the relationship between purchasing frequency and customer spending.

---

## 3D Customer Segmentation

The project also visualizes customers using all three RFM dimensions:

```text
X → Recency
Y → Frequency
Z → Monetary
```

This provides a three-dimensional view of customer behavior and cluster separation.

---

# Machine Learning Pipeline

The complete preprocessing and clustering process is combined into a single Scikit-Learn Pipeline.

```text
RFM Data
   ↓
ColumnTransformer
   ↓
Log Transformation
   ↓
StandardScaler
   ↓
K-Means
   ↓
Customer Cluster
```

This approach ensures that the same preprocessing logic used during training is reused during deployment.

---

# Model Serialization

The final trained pipeline is saved using Joblib.

```python
joblib.dump(
    kmeans_pipeline,
    "customer_segmentation_pipeline.pkl"
)
```

Saved model:

```text
customer_segmentation_pipeline.pkl
```

The deployed FastAPI application loads this trained pipeline for customer segmentation predictions.

---

# FastAPI Backend

The Machine Learning model is integrated into a FastAPI REST API.

The backend:

1. Loads the trained pipeline.
2. Validates customer input.
3. Creates a DataFrame.
4. Sends the data through the trained pipeline.
5. Generates a cluster prediction.
6. Maps the cluster to a business segment.
7. Returns a business recommendation.

---

# API Architecture

```text
Frontend
   |
   | Customer RFM Data
   ↓
FastAPI
   |
   ↓
Pydantic Validation
   |
   ↓
Pandas DataFrame
   |
   ↓
Saved ML Pipeline
   |
   ↓
K-Means Prediction
   |
   ↓
Cluster ID
   |
   ↓
Business Segment Mapping
   |
   ↓
Recommendation
   |
   ↓
JSON Response
```

---

# Pydantic Input Schema

The API accepts three inputs:

```text
Recency
Frequency
Monetary
```

Validation rules:

| Feature | Validation |
|---|---|
| Recency | Must be >= 0 |
| Frequency | Must be >= 1 |
| Monetary | Must be >= 0 |

This prevents invalid customer values from entering the Machine Learning pipeline.

---

# API Endpoints

## 1. Root Endpoint

```http
GET /
```

Returns the API status.

Example:

```json
{
  "status": "success",
  "message": "Customer Segmentation API is running"
}
```

---

## 2. Health Check

```http
GET /health
```

Example:

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

This endpoint can be used to verify that the application and model are available.

---

## 3. Customer Prediction

```http
POST /predict
```

### Request

```json
{
  "Recency": 30,
  "Frequency": 10,
  "Monetary": 5000
}
```

### Response

```json
{
  "cluster": 2,
  "segment": "Regular / Low-Value",
  "recommendation": "Use personalized recommendations, cross-selling and targeted promotions."
}
```

---

# Frontend Application

The project includes a custom frontend interface connected to the FastAPI backend.

The interface allows a user to enter:

```text
Recency
Frequency
Monetary
```

After clicking the prediction button, the application displays:

- Predicted cluster
- Customer segment
- Customer profile
- Business recommendation

The frontend is designed to make the Machine Learning model accessible without requiring the user to directly interact with API requests.

---

# Frontend Features

The application provides:

- Customer RFM input form
- Real-time prediction
- Segment visualization
- Customer behavior explanation
- Business recommendations
- Model information
- Responsive interface
- API integration

---

# End-to-End Prediction Flow

```text
User enters RFM values
          ↓
Frontend sends API request
          ↓
FastAPI receives request
          ↓
Pydantic validates input
          ↓
Input converted to DataFrame
          ↓
Saved ML pipeline processes data
          ↓
K-Means predicts cluster
          ↓
Cluster mapped to segment
          ↓
Business recommendation generated
          ↓
Result returned to frontend
```

---

# Business Insights

The segmentation system converts Machine Learning results into business actions.

| Segment | Main Objective | Strategy |
|---|---|---|
| Inactive / Lost | Reactivate customers | Win-back campaigns and discounts |
| High-Value / Loyal | Retain valuable customers | Loyalty rewards and premium benefits |
| Regular / Low-Value | Increase customer value | Cross-selling and personalized promotions |

---

# Why RFM Analysis?

RFM is useful because it captures three important aspects of customer behavior:

```text
Recency
"When did the customer last purchase?"

Frequency
"How often does the customer purchase?"

Monetary
"How much does the customer spend?"
```

Together, these features provide a compact behavioral profile of each customer.

---

# Why Customer Segmentation?

Customer segmentation helps businesses avoid a one-size-fits-all marketing approach.

Instead of:

```text
All Customers
      ↓
Same Marketing Strategy
```

the business can use:

```text
Inactive / Lost
      ↓
Reactivation Strategy

High-Value / Loyal
      ↓
Loyalty Strategy

Regular / Low-Value
      ↓
Personalization Strategy
```

---

# Key Technical Highlights

- End-to-end Machine Learning workflow
- Customer-level feature engineering
- RFM Analysis
- Revenue calculation
- Log Transformation
- StandardScaler
- ColumnTransformer
- Scikit-Learn Pipeline
- K-Means Clustering
- Elbow Method
- Silhouette Score
- Cluster profiling
- Business segment mapping
- Joblib model serialization
- FastAPI REST API
- Pydantic validation
- Frontend integration
- Production-style deployment

---

# Project Structure

```text
Customer_Segmentation/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── Customer_Segmentation.ipynb
│
├── customer_segmentation.jpeg
│
├── customer_segmentation_pipeline.pkl
│
├── main.py
│
├── requirements.txt
│
└── README.md
```

---

# Technology Stack

### Programming Language

- Python

### Data Analysis

- Pandas
- NumPy

### Data Visualization

- Matplotlib
- Seaborn

### Machine Learning

- Scikit-Learn
- K-Means Clustering
- StandardScaler
- FunctionTransformer
- ColumnTransformer
- Pipeline
- Silhouette Score

### Backend

- FastAPI
- Pydantic

### Model Serialization

- Joblib

### Frontend

- HTML
- CSS
- JavaScript

### Deployment

- Render

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/iparthsolanki/Customer_Segmentation.git
```

Navigate to the project:

```bash
cd Customer_Segmentation
```

---

# Create Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

For Linux/macOS:

```bash
source venv/bin/activate
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Run the Application Locally

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The application will be available at:

```text
http://127.0.0.1:8000
```

---

# API Documentation

FastAPI automatically generates interactive API documentation.

### Swagger UI

```text
http://127.0.0.1:8000/docs
```

### ReDoc

```text
http://127.0.0.1:8000/redoc
```

Swagger can be used to test the `/predict` endpoint directly from the browser.

---

# Example Use Case

Suppose a customer has:

```text
Recency   = 30 days
Frequency = 10 orders
Monetary  = 5000
```

The system sends these values through:

```text
RFM Input
   ↓
Preprocessing
   ↓
Scaling
   ↓
K-Means
   ↓
Cluster
   ↓
Business Segment
   ↓
Recommendation
```

The final output provides a customer segment and a business action that can be used by a marketing or CRM team.

---

# Model Evaluation

The project evaluates clustering using the Silhouette Score.

The final analysis produced:

```text
K = 2  → 0.4187
K = 3  → 0.4010
K = 4  → 0.3616
K = 5  → 0.3664
K = 6  → 0.3469
K = 7  → 0.3353
K = 8  → 0.3155
K = 9  → 0.3093
K = 10 → 0.2954
```

The deployed business segmentation uses:

```text
3 Customer Segments
```

---

# Challenges Solved

### Data Quality

Raw transaction data contains missing customer IDs, invalid quantities, invalid prices, cancelled transactions, and duplicate records.

### Skewed Features

Customer frequency and monetary value can be highly skewed.

### Different Feature Scales

RFM features operate on different numerical scales.

### Unknown Customer Groups

Customer segment labels are not predefined.

### Business Interpretability

K-Means produces numerical cluster IDs that need to be translated into meaningful business categories.

### Deployment

The trained pipeline is serialized and integrated into a FastAPI application for real-time prediction.

---

# Future Improvements

Potential improvements include:

- Customer Lifetime Value prediction
- Automated customer profiling
- More advanced clustering algorithms
- Interactive analytics dashboard
- Customer purchase history visualization
- Database integration
- Authentication and authorization
- Docker containerization
- CI/CD integration
- Model monitoring
- Automated model retraining
- Advanced recommendation system
- Customer-level campaign tracking

---

# Project Outcome

This project demonstrates how raw transaction data can be converted into actionable customer intelligence.

```text
Transaction Data
       ↓
RFM Features
       ↓
Machine Learning
       ↓
Customer Segments
       ↓
Business Strategies
```

The final application connects Data Analytics, Machine Learning, API Development, Frontend Development, and Deployment into a single end-to-end project.

---

# Live Application

The complete Customer Segmentation application is deployed online.

<p align="center">

<a href="https://customer-segmentation-1-zbxr.onrender.com/">
  <strong>Open Customer Segmentation Application</strong>
</a>

</p>

**Live URL:**

https://customer-segmentation-1-zbxr.onrender.com/

---

# Author

**Parth Solanki**

BCA | Data Science | Machine Learning | Generative AI

---

# License

This project is created for educational, portfolio, and demonstration purposes.
