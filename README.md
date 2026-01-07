# 🚀 OpenTrace Analytics

<div align="center">

## Universal • Self-Hosted • Privacy-First • High-Performance Analytics Platform

[![Stable Version](https://img.shields.io/badge/Stable-v1.1.5-green?style=for-the-badge&logo=git&logoColor=white)](https://github.com/del4pp/opentrace/releases/tag/v1.1.5)
[![License](https://img.shields.io/badge/License-AGPL%20v3-green?style=for-the-badge&logo=gnu&logoColor=white)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/get-docker/)

### 🚀 What's New in v1.1.5 (Stable)

OpenTrace v1.1.5 introduces significant improvements to behavioral analysis, custom reporting, and real-time event exploration.

- **Advanced Custom Reports**: Build ad-hoc reports with custom metrics and dimensions directly from the dashboard.
- **JSON Payload Aggregation**: Native support for extracting and calculating data from event payloads (e.g., Revenue, Price, Duration).
- **User Timeline**: Granular chronological stream of every action performed by a specific user for deep-dive analysis.
- **Live Explorer 2.0**: Enhanced event stream with smart payload summaries and direct drill-down to user histories.
- **Behavioral Segments**: Create dynamic user groups based on specific actions and property sets.
- **Cohort Retention**: Visual heatmap analysis of user return rates and long-term stickiness.
- **Native Backup System**: One-click system snapshots for complete data safety.

### ✅ Migration from v1.0.x
- **Enhanced Funnels**: Improved multi-step path analysis with goal completion tracking.
- **Dynamic SMTP**: Fully configurable email server for reliable authentication and system notifications.
- **One-click Updates**: Optimized system update workflow via the administrative panel.

### Tech Stack
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=flat-square&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![ClickHouse](https://img.shields.io/badge/Database-ClickHouse-FFCC00?style=flat-square&logo=clickhouse&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

[![GitHub stars](https://img.shields.io/github/stars/del4pp/opentrace?style=social)](https://github.com/del4pp/opentrace/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/del4pp/opentrace?style=social)](https://github.com/del4pp/opentrace/network/members)

---

**🌟 [Live Demo](https://demo.opentrace.dev) • 📖 [Documentation](docs/) • 🐛 [Report Bug](https://github.com/del4pp/opentrace/issues) • 💡 [Request Feature](https://github.com/del4pp/opentrace/issues)**

---

</div>

---

## 🚀 Quick Start

### ⚡ Installation (2 Minutes)

<div align="center">

| Method | Time | Difficulty |
|--------|------|------------|
| **Automated Installer** | 2 min | ⭐⭐☆ |
| **Docker Manual** | 5 min | ⭐⭐⭐ |
| **From Source** | 15 min | ⭐⭐⭐⭐ |

</div>

#### Option 1: Automated Installer (Recommended)

```bash
# Clone & run installer
git clone https://github.com/del4pp/opentrace.git
cd opentrace
chmod +x install.sh && ./install.sh

# Access at https://analytics.example.com
# Login: admin@opentrace.io / [generated-password]
```

#### Option 2: Docker Compose

```bash
# Clone repository
git clone https://github.com/del4pp/opentrace.git
cd opentrace

# Start production environment
make prod-build

# Or manually:
docker-compose -f docker-compose.prod.yml up -d --build
```

#### Option 3: Development Setup

```bash
# Clone repository
git clone https://github.com/del4pp/opentrace.git
cd opentrace

# Install dependencies
make install

# Start development environment
make dev

# Run tests & linting
make test && make lint
```

> 📚 **Detailed Documentation**: [Installation Guide](docs/en/README.html) | [API Reference](docs/en/API.html) | [Architecture](docs/en/ARCHITECTURE.html) | [Contributing](docs/en/CONTRIBUTING.html)

---

## 💡 Use Cases & Examples

<div align="center">

### 🛒 **E-commerce Analytics**
```python
# Track purchases and revenue
requests.post('https://analytics.example.com/api/v1/event', json={
    "name": "purchase_completed",
    "project_id": "ecommerce",
    "payload": {
        "product_id": "premium_plan",
        "amount": 49.99,
        "currency": "USD",
        "category": "subscription"
    }
})
```

### 🔧 **SaaS Feature Tracking**
```python
# Track user interactions
requests.post('https://analytics.example.com/api/v1/event', json={
    "name": "feature_used",
    "project_id": "my_saas",
    "payload": {
        "feature": "export_data",
        "user_plan": "premium",
        "export_format": "csv"
    }
})
```

### 📊 **API Monitoring**
```python
# Track API performance
requests.post('https://analytics.example.com/api/v1/event', json={
    "name": "api_request",
    "project_id": "api_service",
    "payload": {
        "endpoint": "/api/v1/users",
        "method": "POST",
        "response_time_ms": 245,
        "status_code": 201
    }
})
```

</div>

---

## 🔒 Privacy First - No Compromises

<div align="center">

### ❌ What We DON'T Track
- **No Cookies** - Zero browser storage
- **No Fingerprinting** - No device identification
- **No Personal Data** - IP addresses are anonymized
- **No Third Parties** - Everything self-hosted
- **No Consent Banners** - No GDPR compliance headaches

### ✅ What You Get Instead
- **100% Data Sovereignty** - Your data, your servers
- **Real-time Analytics** - Live user tracking without cookies
- **GDPR Compliant** - No personal data collection
- **Lightning Fast** - Sub-2KB tracking script
- **Open Source** - Audit everything yourself

> 🚀 **"Privacy is not an option, but a fundamental right."**
>
> Replace Google Analytics with a privacy-first alternative that gives you complete control over your data.

</div>

---

## 秤 OpenTrace vs. Competition

<div align="center">

| Feature | OpenTrace | Google Analytics | Matomo | Plausible |
|---------|-----------|------------------|--------|-----------|
| **Privacy** | ✅ 100% | ❌ Tracks everything | ⚠️ Opt-in | ✅ Good |
| **Self-Hosted** | ✅ Yes | ❌ No | ✅ Yes | ⚠️ Cloud only |
| **User Timeline** | ✅ Native | ⚠️ Limited | ✅ Yes | ❌ No |
| **Custom Reports** | ✅ BI Engine | ⚠️ Sampling | ✅ Yes | ⚠️ Basic |
| **Funnels** | ✅ Multi-step | ✅ Yes | ✅ Yes | ⚠️ Basic |
| **Retention** | ✅ Cohort Map | ✅ Yes | ✅ Yes | ❌ No |
| **Cookie-free** | ✅ Yes | ❌ Cookies required | ❌ Cookies | ✅ Yes |

</div>

---

## ✨ Core Features

<div align="center">

### 🎯 **Powerful Tracking Engine**
| Feature | Description | Performance |
|---------|-------------|-------------|
| 👤 **User Timeline** | Detailed chronological stream of every user action. | Instant deep-dive |
| 👥 **Behavioral Segments** | Custom grouping by behaviors and properties. | Real-time resolution |
| 📉 **Retention Heatmaps** | Cohort analysis of user loyalty and churn. | 30-day tracking |
| 📊 **BI Reports** | Aggregated data extraction from JSON payloads. | Sub-second OLAP |
| 🌐 **Web Analytics** | <2KB script, zero cookies, GDPR by design. | Sub-ms tracking |
| 🔧 **Custom Events** | High-performance REST API for any platform. | 100k+ EPS |

</div>

---

## 🏁 Getting Started

<div align="center">

### 🎯 **Production Ready in 2 Minutes**

[![Docker](https://img.shields.io/badge/🐳_Docker-Required-2496ED?style=for-the-badge&logo=docker)](https://docs.docker.com/get-docker/)
[![Linux](https://img.shields.io/badge/🐧_Linux-Recommended-FCC624?style=for-the-badge&logo=linux)](https://ubuntu.com/)

</div>

### 📦 Automated Installation

```bash
# One-command setup
git clone https://github.com/del4pp/opentrace.git
cd opentrace
chmod +x install.sh && ./install.sh
```

---

## 🤝 Contributing

<div align="center">

### 🌟 **We Welcome Contributions!**

[![Contributors](https://img.shields.io/github/contributors/del4pp/opentrace?style=for-the-badge)](https://github.com/del4pp/opentrace/graphs/contributors)
[![PRs](https://img.shields.io/github/issues-pr/del4pp/opentrace?style=for-the-badge)](https://github.com/del4pp/opentrace/pulls)

#### 👨‍💻 **Core Team**

**Built with ❤️ by [del4pp](https://github.com/del4pp)**  
*Proudly based in Ukraine 🇺🇦*

</div>

---

*"Privacy is not an option, but a fundamental right."*

**OpenTrace - Universal • Self-Hosted • Privacy-First Analytics** 🚀
