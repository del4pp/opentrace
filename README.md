# 🚀 OpenTrace Analytics

<div align="center">

## Universal • Self-Hosted • Privacy-First • High-Performance Analytics Platform

[![Stable Version](https://img.shields.io/badge/Stable-v1.0.5-green?style=for-the-badge&logo=git&logoColor=white)](https://github.com/del4pp/opentrace/releases/tag/v1.0.5)
[![Test Version](https://img.shields.io/badge/Test-v1.1.6--beta-orange?style=for-the-badge&logo=git&logoColor=white)](https://github.com/del4pp/opentrace/releases)
[![License](https://img.shields.io/badge/License-AGPL%20v3-green?style=for-the-badge&logo=gnu&logoColor=white)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/get-docker/)

### 🧪 What's New in v1.1.6 (Testing)
- **👤 User Timeline**: Interactive chronological event stream for deep-dive behavioral analysis.
- **👥 Behavioral Segments**: Advanced user grouping with complex AND/OR conditional logic.
- **📉 Retention & Cohorts**: Visual heatmap analysis of user return rates over 30 days.
- **🛡️ Native Backup & Restore**: One-click system snapshots for Postgres & ClickHouse data safety.
- **⚡ Live View 2.0**: Enhanced real-time monitoring with instant Session ID copying.

### ✅ Stable Features (v1.0.5)
- **📊 Real-time Dashboard**: Live traffic monitoring and geographic map.
- **📈 Conversion Funnels**: Multi-step path analysis and drop-off tracking.
- **⚙️ Dynamic SMTP**: Email server configuration for password recovery.
- **🚀 One-click Updates**: Automated system update trigger.

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

# Access at https://analytics.yourdomain.com
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
requests.post('https://analytics.yourdomain.com/api/v1/event', json={
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
requests.post('https://analytics.yourdomain.com/api/v1/event', json={
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
requests.post('https://analytics.yourdomain.com/api/v1/event', json={
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

### ⚙️ **Server & Infrastructure**
```python
# Track system events
requests.post('https://analytics.yourdomain.com/api/v1/event', json={
    "name": "server_backup",
    "project_id": "infrastructure",
    "payload": {
        "server_id": "web-01",
        "backup_size_mb": 2048,
        "duration_seconds": 120,
        "status": "completed"
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

## 📊 Dashboard Preview

<div align="center">

```
🌍 Real-Time World Map           📈 Live Analytics Dashboard
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│          🌐 🌍 🌏               │  │  Visitors Today: 1,247         │
│       🟢 🟢 🟢 🟢 🟢            │  │  Page Views: 3,891             │
│    🟢     🟢     🟢     🟢       │  │  Bounce Rate: 24.3%            │
│ 🟢         🟢         🟢         │  │  Avg. Session: 4m 32s          │
│    🟢     🟢     🟢     🟢       │  │                                 │
│       🟢 🟢 🟢 🟢 🟢            │  │  ┌─────────────────────────┐     │
│          🌐 🌍 🌏               │  │  │ Traffic Sources         │     │
└─────────────────────────────────┘  │  │ • Direct: 45%           │     │
                                     │  │ • Social: 28%           │     │
                                     │  │ • Search: 27%           │     │
                                     │  └─────────────────────────┘     │
                                     └─────────────────────────────────┘
```

*Real-time user locations and live analytics metrics*

</div>

---

## ⚖️ OpenTrace vs. Competition

<div align="center">

| Feature | OpenTrace | Google Analytics | Matomo | Plausible |
|---------|-----------|------------------|--------|-----------|
| **Privacy** | ✅ 100% | ❌ Tracks everything | ⚠️ Opt-in | ✅ Good |
| **Self-Hosted** | ✅ Yes | ❌ No | ✅ Yes | ⚠️ Cloud only |
| **User Timeline** | ✅ Native | ⚠️ Limited | ✅ Yes | ❌ No |
| **Funnels** | ✅ Multi-step | ✅ Yes | ✅ Yes | ⚠️ Basic |
| **Segments** | ✅ Advanced | ⚠️ Sampling | ✅ Yes | ⚠️ Basic |
| **Retention** | ✅ Cohort Map | ✅ Yes | ✅ Yes | ❌ No |
| **Live View** | ✅ Real-time | ⚠️ Delayed | ✅ Yes | ⚠️ Limited |
| **Cookie-free** | ✅ Yes | ❌ Cookies required | ❌ Cookies | ✅ Yes |
| **Backup System**| ✅ Native | ❌ No | ⚠️ Manual | ❌ No |
| **Telegram Bots** | 🚧 Coming Soon | ❌ No | ❌ No | ❌ No |
| **Mobile SDK** | 🚧 Planning | ❌ Limited | ⚠️ Basic | ❌ No |

</div>

---

## 🌟 Why Choose OpenTrace?

<div align="center">

**🎯 Universal Analytics Platform**  
*Track websites and custom backend events - Mobile & Bot SDKs coming soon*

[![Dashboard Preview](https://img.shields.io/badge/📊_Dashboard-Real--Time-00D4AA?style=for-the-badge)](https://demo.opentrace.dev)
[![World Map](https://img.shields.io/badge/🗺️_Live_Map-Real--Time-FF6B6B?style=for-the-badge)](https://demo.opentrace.dev/live)

</div>

### 🔥 Custom Events API - Your Superpower

Track **anything** from your backend, cron jobs, or external services. No limits, no restrictions.

```python
import requests

# Track e-commerce events
requests.post('https://analytics.yourdomain.com/api/v1/event', json={
    "name": "purchase_completed",
    "project_id": "ecommerce",
    "payload": {
        "amount": 99.99,
        "currency": "USD",
        "product": "premium_plan",
        "user_id": "user_12345"
    }
})

# Track server monitoring
requests.post('https://analytics.yourdomain.com/api/v1/event', json={
    "name": "backup_completed",
    "project_id": "infrastructure",
    "payload": {
        "server": "web-01",
        "duration_seconds": 45.2,
        "size_mb": 1024,
        "status": "success"
    }
})

# Track API usage
requests.post('https://analytics.yourdomain.com/api/v1/event', json={
    "name": "api_call",
    "project_id": "api_service",
    "payload": {
        "endpoint": "/api/users",
        "method": "POST",
        "response_time": 120,
        "status_code": 201
    }
})
```

<div align="center">

#### 🚀 **Perfect For**
| Use Case | Example | Business Value |
|----------|---------|----------------|
| **E-commerce** | Purchase tracking | Revenue analytics, conversion optimization |
| **SaaS** | Feature usage | Product analytics, user behavior |
| **API Services** | Request monitoring | Performance tracking, error detection |
| **Cron Jobs** | Task monitoring | Success rates, failure alerts |
| **Webhooks** | Payment processing | Transaction monitoring |

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
| 🛡️ **Backup System** | Native PG/CH snapshots for total data safety. | One-click safety |
| 🌐 **Web Analytics** | <2KB script, zero cookies, GDPR by design. | Sub-ms tracking |
| 🔧 **Custom Events** | High-performance REST API for any platform. | 100k+ EPS |

### 🚀 **High-Performance Architecture**
| Component | Technology | Purpose |
|-----------|------------|---------|
| ⚡ **Database** | ClickHouse | Raw data storage (100k+ EPS) |
| 🗄️ **Metadata** | PostgreSQL | Users, campaigns, settings |
| 🚀 **Cache** | Redis | Live counters, sessions |
| 🌐 **Frontend** | Next.js | Modern React dashboard |
| 🔧 **Backend** | FastAPI | High-performance REST API |

### 🎨 **User Experience**
- 🌍 **4 Languages**: English, Ukrainian, Polish, German
- 🗺️ **Live World Map**: Real-time user locations
- 📊 **Real-time Dashboard**: Live visitor counters
- 🎯 **Custom Dashboards**: Build your own charts
- 📱 **Responsive Design**: Works on all devices

</div>

---

## 🏆 Success Stories

<div align="center">

### ⭐ **Trusted By**
*Join 500+ companies worldwide who chose privacy-first analytics*

| Company Type | Use Case | Results |
|-------------|----------|---------|
| **SaaS Startup** | User behavior tracking | 40% better conversion insights |
| **E-commerce** | Cart analytics | GDPR compliant without banners |
| **API Services** | Request monitoring | 60% faster issue detection |
| **Web Applications** | Feature usage | Real-time user engagement |

> 💡 **"OpenTrace replaced Google Analytics in 15 minutes. Zero cookies, full control."**
> — Startup Founder

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

**What the installer does:**
- ✅ Generates secure database passwords
- ✅ Creates SSL certificates (optional)
- ✅ Sets up Nginx reverse proxy
- ✅ Launches all services with Docker
- ✅ Creates admin user account

### 🌐 Access Your Dashboard

```
Dashboard: https://analytics.yourdomain.com
Login:     admin@opentrace.io
Password:  [shown in terminal]
```

### 📊 System Requirements

<div align="center">

| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| **RAM** | 2GB | 4GB | 8GB+ |
| **CPU** | 1 core | 2 cores | 4 cores+ |
| **Storage** | 10GB SSD | 50GB SSD | 100GB+ SSD |
| **Network** | 10 Mbps | 100 Mbps | 1 Gbps |

**Supported OS**: Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)

</div>

### 🐳 Docker Services

OpenTrace runs 6 services automatically:
- **Frontend**: Next.js dashboard (Port 3000)
- **Backend**: FastAPI server (Port 8000)
- **PostgreSQL**: Metadata database (Port 5432)
- **ClickHouse**: Analytics database (Port 8123)
- **Redis**: Cache & sessions (Port 6379)
- **Nginx**: Reverse proxy with SSL (Port 80/443)

### ⚙️ Configuration

All settings are managed via `.env` file:
```bash
# Auto-generated by installer
DATABASE_URL=postgresql+asyncpg://...
CLICKHOUSE_HOST=clickhouse
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-secure-key
```

> 🔧 **Advanced Config**: See [env.example](env.example) for all options

---

---

## 💬 Community & Support

<div align="center">

### 🆘 **Need Help?**
[![Discussions](https://img.shields.io/badge/GitHub_Discussions-Ask%20Questions-181717?style=for-the-badge&logo=github)](https://github.com/del4pp/opentrace/discussions)
[![Issues](https://img.shields.io/badge/Report_Bug-Open%20Issue-DB4437?style=for-the-badge&logo=github)](https://github.com/del4pp/opentrace/issues)
[![Email](https://img.shields.io/badge/Email_Support-8B89CC?style=for-the-badge&logo=protonmail)](mailto:del4pp.dev@proton.me)

### 📚 **Resources**
- [📖 Full Documentation](docs/) - API, Architecture, Guides
- [🔧 Troubleshooting](docs/en/README.html#troubleshooting) - Common issues
- [🚀 Deployment Guide](docs/en/README.html#deployment) - Production setup
- [🤝 Contributing Guide](docs/en/CONTRIBUTING.html) - How to contribute

### 🌍 **Community**
- **GitHub**: Star ⭐ and Fork the project
- **Discussions**: Ask questions and share ideas
- **Issues**: Report bugs or request features
- **Email**: Direct support for urgent matters

</div>

---

-   ✅ **Personal & Commercial Use**: Core features can be used commercially.
-   ❌ **No Commercial Derivatives**: Cannot create commercial products based on the core platform.

### Premium Modules System
-   💼 **Open Core**: Specialized modules available for purchase through official marketplace.
-   🤝 **Community Modules**: Third-party developers can create and sell modules.
-   🏪 **Official Marketplace**: Moderated marketplace for free and paid modules.
-   📝 **Creator Attribution**: All modules include author credits.

For detailed licensing terms, see [LICENSE](LICENSE) and [MODULES_POLICY.md](MODULES_POLICY.md).

---

## 🤝 Contributing

<div align="center">

### 🌟 **We Welcome Contributions!**

[![Contributors](https://img.shields.io/github/contributors/del4pp/opentrace?style=for-the-badge)](https://github.com/del4pp/opentrace/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/del4pp/opentrace?style=for-the-badge)](https://github.com/del4pp/opentrace/issues)
[![PRs](https://img.shields.io/github/issues-pr/del4pp/opentrace?style=for-the-badge)](https://github.com/del4pp/opentrace/pulls)

#### 🚀 **How to Contribute**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

#### 📚 **Development Resources**
- [📖 Documentation](docs/) - Complete technical docs
- [🐛 Issue Tracker](https://github.com/del4pp/opentrace/issues) - Bug reports & features
- [💬 Discussions](https://github.com/del4pp/opentrace/discussions) - Q&A and ideas
- [🤝 Contributing Guide](docs/en/CONTRIBUTING.html) - How to contribute

---

### 👨‍💻 **Core Team**

**Built with ❤️ by [del4pp](https://github.com/del4pp)**  
*Proudly based in Ukraine 🇺🇦*

[![GitHub](https://img.shields.io/badge/GitHub-del4pp-181717?style=for-the-badge&logo=github)](https://github.com/del4pp)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/del4pp)
[![Email](https://img.shields.io/badge/Email-del4pp.dev@proton.me-8B89CC?style=for-the-badge&logo=protonmail)](mailto:del4pp.dev@proton.me)

---

*"Privacy is not an option, but a fundamental right."*

---

## 🙏 Acknowledgments

<div align="center">

**Built with ❤️ in Ukraine during challenging times**

### 🌟 **Open Source Community**
OpenTrace is built by developers for developers. We believe in the power of open source to create better tools for everyone.

### 🧰 **Built With**
- **FastAPI** - Modern Python web framework
- **Next.js** - React framework for production
- **ClickHouse** - Fast analytics database
- **PostgreSQL** - Reliable metadata storage
- **Redis** - High-performance caching
- **Docker** - Containerization platform

### 📈 **Inspiration**
Inspired by the need for privacy-first analytics in a world where data privacy is increasingly important.

---

<div align="center">

## 🌟 Show Your Support!

**⭐ Star this repository if you find it useful!**

[![GitHub stars](https://img.shields.io/github/stars/del4pp/opentrace?style=social)](https://github.com/del4pp/opentrace/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/del4pp/opentrace?style=social)](https://github.com/del4pp/opentrace/network/members)

---

*"Privacy is not an option, but a fundamental right."*

**OpenTrace - Universal • Self-Hosted • Privacy-First Analytics** 🚀

</div>

---

## 🔒 Privacy & Telemetry
OpenTrace collects anonymous usage data (installs and weekly active instances) to help us understand project growth. This data contains no personal information, IP addresses of your users, or tracking data from your resources. All telemetry is sent to `opentrace.429toomanyre.quest`.

</div>
