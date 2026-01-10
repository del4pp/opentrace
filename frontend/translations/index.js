export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      views: "Overview",
      resources: "Resources",
      campaigns: "Campaign Links",
      events: "Event Tracking",
      tags: "Tag Manager",
      settings: "Settings",
      analytics: "Explorer",
      live: "Live View",
      customAnalytics: "Custom Reports",
      heatmaps: "Heatmaps",
      explorer: "Live Explorer",
      funnels: "Conversion Funnels",
      retention: "Retention & Cohorts",
      segments: "Behavioral Segments",
      timeline: "User Timeline",
      docs: "API Documentation",
      signIn: "Sign In",
      features: "Features",
      modules: "Modules",
      users: "Team",
      monitor: "Resource Monitor",
      groups: {
        analytics: "Insights",
        tracking: "Data Collection",
        system: "Configuration",
      },
    },
    hero: {
      tag: "Self-Hosted • Privacy-First",
      title: "Own your analytics data.",
      subtitle:
        "A powerful, open-source alternative to Google Analytics. Track everything without compromising user privacy.",
      ctaPrimary: "Get Started",
      ctaSecondary: "View on GitHub",
      help: {
        title: "Welcome to OpenTrace",
        content:
          "OpenTrace is a next-generation analytics platform. You can use it to track websites, mobile apps, and Telegram bots. All data is processed in real-time and stays on your infrastructure.",
      },
    },
    dashboard: {
      title: "Performance Overview",
      subtitle: "Monitoring real-time traffic across all nodes",
      stats: {
        visitors: "Total Visitors",
        views: "Page Views",
        session: "Avg. Session",
        bounce: "Bounce Rate",
      },
      activityVolume: "Activity Volume",
      chartLabels: {
        now: "Now",
        h6: "6h ago",
        h12: "12h ago",
        h18: "18h ago",
        h24: "24h ago",
      },
      help: {
        title: "About Dashboard",
        content:
          "The Dashboard provides a bird's-eye view of your entire infrastructure. Here you can track real-time traffic, conversion rates, and the health of your connected resources.",
      },
    },
    resources: {
      title: "Your Resources",
      subtitle: "Manage your websites and bots",
      add: "Add Resource",
      help: {
        title: "Resource Management",
        content:
          "Resources are the core of your tracking. Register your websites, bots, or apps to get a unique Tracking ID. Our advanced SDK (v1.1) automatically tracks clicks, form submissions, session duration, and scroll depth. It also captures marketing IDs (FBCLID/TTCLID) to enable precise server-side Conversion API (CAPI) tracking.",
      },
      table: {
        name: "Resource Name",
        type: "Type",
        id: "Internal ID",
        status: "Status",
      },
      types: {
        website: "Website",
        bot: "Telegram Bot",
        app: "Mobile Application",
      },
      fields: {
        name: "Name",
        type: "Resource Type",
        token: "Bot Token",
        bundleId: "App Bundle ID",
        url: "Website URL",
      },
    },
    campaigns: {
      title: "Campaign Links",
      subtitle: "UTM tags and bot deep-links",
      create: "Create Link",
      help: {
        title: "Campaign Tracking",
        content:
          "Create tracked links for your ads. Use the UTM generator for websites or deep-link generator for Telegram bots to identify exactly which ad source brought the user.",
      },
      table: {
        source: "Source",
        medium: "Medium",
        campaign: "Campaign",
        clicks: "Clicks",
        conversion: "Conv. %",
      },
    },
    events: {
      title: "Event Tracking",
      subtitle: "Define clicks, views and custom actions",
      add: "Add Event",
      help: {
        title: "Event Regulation",
        content:
          "Configure what actions to track. Define key events like clicks or form submissions. These events are not just for analytics — they serve as triggers for server-side Conversion APIs (CAPI) to Facebook, TikTok, and more.",
      },
      table: {
        name: "Event Name",
        trigger: "Trigger Type",
        source: "Target Resource",
        count: "Total Hits",
      },
      botUTM: {
        title: "Telegram Bot UTM Constructor",
        subtitle:
          "Generate a deep-link with a unique 12-character label to track bot subscriptions.",
        botUsername: "Bot Username (@)",
        source: "Traffic Source",
        medium: "Medium",
        campaign: "Campaign Name",
        generate: "Generate Tracking Link",
        yourLink: "Your Deep-Link",
        copy: "Copy",
        snippet: "Implementation Snippet",
        close: "Close Constructor",
      },
    },
    tags: {
      title: "Tag Manager",
      subtitle: "Inject pixels and metrics without code",
      add: "Add Tag",
      help: {
        title: "Tag Management",
        content:
          "Manage third-party analytics (FB Pixel, GA4) in one place. Add the OpenTrace container to your site once, and toggle other scripts on/off without touching your code.",
      },
      table: {
        name: "Tag Name",
        provider: "Provider",
        active: "Is Active",
      },
      snippet: {
        title: "Unified Resource Tracking",
        description:
          "If you have already installed the main tracking code for this resource, no additional scripts are needed. Your tags will be automatically synchronized and injected into your site.",
      },
    },
    settings: {
      title: "System Configuration",
      subtitle: "Manage your analytics workspace",
      general: "General Settings",
      generalDesc: "Workspace name and visual preferences",
      api: "API Keys",
      apiDesc: "Keys for authentication across your apps",
      security: {
        title: "Login & Security",
        desc: "Identify management and visibility controls",
        adminEmail: "Primary Admin Email",
        update: "Update Email",
        showDemo: "Show Demo Data",
        showDemoDesc: "Display simulated data if resource is empty",
        skipLanding: "Skip Landing Page",
        skipLandingDesc: "Redirect directly to Login instead of Landing",
        resetPassword: "Send Password Reset Link",
      },
      language: "Interface Language",
      workspaceName: "Workspace Name",
      ingestionKey: "Ingestion Key",
      rotate: "Rotate",
      viewDocs: "View API Documentation",
      appearance: "Appearance",
      appearanceDesc: "UI theme and preferences",
      help: {
        title: "Settings",
        content:
          "Configure your global system preferences and security tokens here.",
      },
      checkUpdate: "Check for Updates",
      upToDate: "System is up to date",
      logs: {
        title: "System Logs",
        subtitle: "Real-time records from ClickHouse storage",
        level: "Level",
        module: "Module",
        message: "Message",
        time: "Timestamp",
      },
      security: {
        title: "Security & Access",
        desc: "Manage admin account and login screen",
        adminEmail: "Admin Email",
        update: "Update",
        showDemo: "Show Demo Data",
        showDemoDesc: "Display demo credentials on login page",
        skipLanding: "Skip Landing Page",
        skipLandingDesc: "Redirect directly to login instead of homepage",
        resetPassword: "Restore Password",
        resetSuccess: "Reset link sent to email",
      },
      smtp: {
        title: "SMTP Configuration",
        desc: "Configure email server for password resets",
        host: "SMTP Host",
        port: "Port",
        user: "User",
        pass: "Password",
        from: "From Email",
        save: "Save SMTP Settings",
      },
      backup: {
        title: "Backup & Recovery",
        desc: "Create full snapshots of your database and telemetry",
        create: "Create New Backup",
        history: "Backup History",
        restore: "Restore",
        restoreConfirm:
          "ATTENTION: This will overwrite your current database with the selected backup. Proceed?",
        size: "Size",
        date: "Date",
        noBackups: "No backups found.",
      },
      updates: {
        title: "Update Management",
        desc: "Keep your system secure and up to date",
        current: "Current Version",
        latest: "Latest Version",
        stable: "You are on the latest stable version",
        newAvailable: "A new version is available",
        install: "Install Update Now",
        installing: "Installing Update...",
        confirmTitle: "System Update",
        confirmMsg:
          "Are you sure you want to update? This will rebuild the containers and cause a short downtime.",
        backupWarning:
          "Recommendation: Backup your database before proceeding.",
        status: "System status",
        installSuccess: "Update triggered successfully!",
      },
    },
    integration: {
      title: "Installation",
      subtitle: "Add this code to your website",
      copy: "Copy Snippet",
      desc: "Place this script before the closing </head> tag of your website.",
    },
    modules: {
      title: "Module Marketplace",
      subtitle: "Extend OpenTrace with specialized plugins.",
      activate: "Activate Module",
      keyPlaceholder: "Enter license key or module code...",
      status: {
        installed: "Installed",
        available: "Available",
        premium: "Premium",
      },
    },
    analytics: {
      trackedEvents: {
        title: "Tracked Events",
        empty: "No specific events tracked in this period.",
      },
      trafficSources: "Traffic Sources",
      osBreakdown: "Operating Systems",
      browserBreakdown: "Browsers",
      deviceBreakdown: "Device Types",
      topReferrers: "Top Referrers",
      eventType: "Event Type",
      title: "Explorer",
      subtitle: "Analyze performance with granular filters.",
      filters: "Advanced Filters",
      apply: "Apply Filters",
      help: {
        title: "Analytics Explorer",
        content:
          "Use this section to slice and dice your traffic data. Filters allow you to focus on specific sources, devices, or timeframes.",
      },
      metrics: {
        visitors: "Unique Visitors",
        pageviews: "Total Events",
        bounce: "Bounce Rate",
        duration: "Avg. Duration",
      },
      reports: {
        title: "Custom Reports",
        subtitle: "Build and save your own data visualizations.",
        create: "Create Report",
        builder: "Report Builder",
        select: "Select Report",
        metric: "Primary Metric",
        dimension: "X-Axis Dimension",
        period: "Analysis Period",
        save: "Save Report",
        adhoc: "Run Ad-hoc",
        metrics: {
          users: "Unique Users",
          sessions: "Total Sessions",
          events: "Total Events",
        },
        dimensions: {
          date: "Timeline (Date)",
          source: "Traffic Source",
          country: "Geography (Country)",
          device: "Device Type",
          event_name: "Event Name",
        },
        help: {
          title: "Custom Reporting",
          content:
            "Design personalized reports by combining any metric with a categorical dimension. Perfect for deep-diving into specific traffic segments or hardware distribution.",
        },
      },
      dateRange: "Date Range",
      startDate: "Start Date",
      endDate: "End Date",
      trafficSource: "Traffic Source",
      deviceType: "Device Type",
      allSources: "All Sources",
      direct: "Direct",
      googleAds: "Google Ads",
      facebook: "Facebook",
      allDevices: "All Devices",
      mobile: "Mobile",
      desktop: "Desktop",
      live: {
        title: "Live Activity",
        subtitle: "Real-time user distribution across the globe",
        online: "Users Online Now",
        map: "Global Presence",
        recent: "Recent Events",
        waiting: "Waiting for events...",
      },
    },
    custom: {
      title: "Report Builder",
      subtitle: "Create sophisticated visual dashboards.",
      create: "Create New Report",
      help: {
        title: "Custom Analytics",
        content:
          "Design your own visualization widgets. Connect directly to raw data streams and build custom KPIs.",
      },
    },
    auth: {
      title: "Identity Access",
      email: "Service Email",
      password: "Security Token",
      submit: "Authenticate",
      help: {
        title: "Identity Access",
        content:
          "Use your administrator credentials to access the secure area. Default credentials for demo are admin@opentrace.io / admin.",
      },
    },
    features_block: {
      tracking: "Universal Tracking",
      trackingDesc:
        "Track interactions across any platform - websites, mobile apps, or custom APIs.",
      realtime: "Real-time Processing",
      realtimeDesc:
        "Built on ClickHouse for instant insights without sampling or delays.",
      ownership: "Data Sovereignty",
      ownershipDesc:
        "Your data stays on your infrastructure. You own 100% of your telemetry.",
    },
    footer: {
      copyright: "© 2025 OpenTrace Analytics",
    },
    landing: {
      nav: {
        features: "Features",
        opensource: "Open Source",
        modules: "Modules",
      },
      hero: {
        badge: "Self-Hosted • Privacy-First • Open Source",
        title: "Own Your Analytics Data",
        subtitle:
          "A powerful, open-source alternative to Google Analytics. Track everything without compromising user privacy. Deploy on your infrastructure in minutes.",
        cta: "Get Started Free",
        github: "View on GitHub",
      },
      stats: {
        opensource: "Open Source",
        languages: "Languages",
        events: "Events Per Second",
      },
      features: {
        title: "Everything You Need",
        subtitle:
          "Powerful analytics platform with enterprise features, built for privacy and performance.",
        analytics: {
          title: "Advanced Analytics",
          desc: "Deep insights with custom filters, funnels, and conversion tracking. Analyze user behavior across all touchpoints.",
        },
        live: {
          title: "Real-Time Monitoring",
          desc: "Watch users interact with your platform in real-time. Live maps, active sessions, and instant event streams.",
        },
        campaigns: {
          title: "Campaign Tracking",
          desc: "Track UTM parameters, deep links, and attribution. Know exactly which campaigns drive results.",
        },
        realtime: {
          title: "Lightning Fast",
          desc: "Built on ClickHouse for instant queries. Process millions of events per second without breaking a sweat.",
        },
        privacy: {
          title: "Privacy-First",
          desc: "GDPR compliant by design. No cookies, no tracking scripts, no data sharing. Your users' privacy is protected.",
        },
        modules: {
          title: "Extensible Platform",
          desc: "Extend functionality with modules. Heatmaps, A/B testing, session replay, and more available in the marketplace.",
        },
      },
      opensource: {
        badge: "100% Open Source",
        title: "Built by the Community, for the Community",
        desc: "OpenTrace is fully open-source under MIT license. No vendor lock-in, no hidden costs, no compromises. Fork it, modify it, make it yours.",
        freedom: "Complete freedom to modify and distribute",
        community: "Active community of contributors",
        transparency: "Transparent development process",
        extensible: "Plugin architecture for custom features",
        cta: "Star on GitHub",
      },
      modules: {
        title: "Extend with Modules",
        desc: "Unlock advanced features with our growing marketplace of plugins and extensions. From heatmaps to AI-powered insights.",
        heatmaps: {
          title: "Heatmaps & Recordings",
          desc: "Visualize clicks, scrolls, and user sessions",
        },
        ab_testing: {
          title: "A/B Testing",
          desc: "Run experiments and optimize conversions",
        },
        funnels: {
          title: "Advanced Funnels",
          desc: "Multi-step conversion analysis",
        },
        attribution: {
          title: "Attribution Models",
          desc: "Multi-touch attribution and ROI tracking",
        },
        cta: "Browse Modules",
      },
      languages: {
        title: "Speak Your Language",
        desc: "OpenTrace supports English, Ukrainian, Polish, and German out of the box. More languages coming soon.",
      },
      cta: {
        title: "Ready to Take Control?",
        desc: "Join thousands of companies using OpenTrace to understand their users while respecting their privacy.",
        button: "Start Tracking Now",
      },
      footer: {
        tagline: "Privacy-first analytics for modern teams",
        product: "Product",
        resources: "Resources",
        community: "Community",
      },
      stats_block: {
        speed: "Query Speed",
        integrity: "Data Integrity",
        scalability: "Scalability",
        events: "Billion+ Events"
      },
      tech_stack: {
        title: "Built for Scale",
        subtitle: "Developed with the most advanced technical stack to ensure stability and performance.",
        fastapi: {
          title: "FastAPI Engine",
          desc: "Asynchronous core handling thousands of requests per second with minimal overhead."
        },
        clickhouse: {
          title: "ClickHouse Storage",
          desc: "The world's fastest columnar database for analytical workloads and real-time reporting."
        },
        nextjs: {
          title: "Next.js Interface",
          desc: "Responsive and modern frontend built with the latest React patterns for fluid experience."
        }
      },
      enterprise: {
        tier: "Tier-1 Infrastructure",
        dashboards: "Custom Dashboards",
        retention: "Infinite Data Retention",
        security: "Secure Architecture",
        api: "API Access"
      }
    },
    forgot_password: {
      title: "Reset Password",
      desc: "Enter your email to receive a reset link.",
      email: "Email Address",
      submit: "Send Reset Link",
      back: "Back to Login",
      new_pass_title: "Set New Password",
      new_pass: "New Password",
      confirm_pass: "Confirm New Password",
      reset_btn: "Reset Password",
      success: "Password reset successfully!",
    },
    auth: {
      title: "Identity Access",
      email: "Service Email",
      password: "Security Token",
      submit: "Authenticate",
      help: {
        title: "Identity Access",
        content:
          "Use your administrator credentials to access the secure area. Default credentials for demo are admin@opentrace.io / admin.",
      },
      login: {
        title: "Authorization",
        subtitle: "Log in to your control panel",
        email: "Email Address",
        password: "Your Password",
        submit: "Sign In",
        forgot: "Forgot password?",
      },
    },
    profile: {
      title: "Profile Settings",
      alert_first_login:
        "Security Alert: You are using a temporary password. You must change it to proceed.",
      change_password: "Change Password",
      current: "Current Password",
      new: "New Password",
      confirm: "Confirm New Password",
      submit: "Update Password",
      success: "Password changed successfully!",
      mismatch: "New passwords do not match",
      logged_in_as: "Logged in as",
    },
    modals: {
      delete_confirm: "Confirm Deletion",
      delete_message:
        "Please enter administrator password to delete this item.",
      admin_password: "Admin Password",
      cancel: "Cancel",
      delete: "Delete",
    },
    funnels: {
      title: "Conversion Funnels",
      subtitle: "Analyze user journeys and drop-offs",
      help: {
        title: "Funnel Analytics",
        content:
          "A funnel is a series of steps a user takes to complete a goal. Here you can track conversion rates between steps, identify where users drop off, and see the average time it takes to convert.",
      },
      create: "Create Funnel",
      builder: "Funnel Builder",
      compare: "Compare Funnels",
      stats: {
        conversion: "Conversion Rate",
        dropoff: "Drop-off",
        ttc: "Time to Convert",
        sessions: "Total Sessions",
        steps: "Steps",
      },
      fields: {
        name: "Funnel Name",
        stepName: "Step Name",
        type: "Trigger Type",
        value: "Value (URL or Event Name)",
        stepValue: "Conversion Value ($)",
        isGoal: "Goal?",
      },
    },
    retention: {
      title: "Retention & Cohorts",
      subtitle: "User return rates over 30 days",
      cohort: "Cohort",
      size: "Size",
      day: "Day",
      percentage: "Percentage",
      absolute: "Absolute",
      help: {
        title: "Cohort Analysis",
        content:
          "Cohort analysis groups users based on their first visit date and tracks how many return over the next 30 days. High retention is the best indicator of product-market fit and long-term user value.",
      },
    },
    segments: {
      title: "Behavioral Segments",
      subtitle: "Create dynamic groups of users based on actions",
      create: "New Segment",
      builder: "Segment Builder",
      name: "Segment Name",
      logic: "Logic",
      addCondition: "Add Condition",
      addGroup: "Add Group",
      preview: "Segment Preview",
      matches: "users match this segment",
      help: {
        title: "Advanced Segmentation",
        content:
          "Segments allow you to filter users by their behavior. For example, you can find users who 'Opened the app' but 'Did not purchase' within 3 days. These segments can be used for deep-dive analysis or targeting.",
      },
    },
    timeline: {
      title: "User Timeline",
      subtitle: "Full event stream for a specific identity",
      searchPlaceholder: "Enter user_id or session_id...",
      noIdentity: "Please enter an identity to view the timeline",
      eventContext: "Event Context",
      properties: "Properties",
      noEvents: "No events found for this user",
      help: {
        title: "User Timeline Analysis",
        content:
          "Timeline provides a granular view of every action a specific user took. Use this for debugging user issues, understanding conversion paths, or preparing for high-touch sales calls.",
      },
    },
    users_page: {
      title: "Team Management",
      subtitle: "Invite and manage your team members",
      invite_title: "Invite New Member",
      email_label: "Email Address",
      send_btn: "Send Invitation",
      loading: "Sending...",
      success: "Invitation sent successfully!",
      placeholder: "colleague@company.com",
      footer_note:
        "An invitation email will be sent with a link to set up their account.",
    },
    monitor: {
      title: "Resource Monitor",
      subtitle: "Full-stack infrastructure health and performance",
      cpu: "Processor Load",
      memory: "Memory Usage",
      disk: "Storage Space",
      uptime: "Server Uptime",
      load_avg: "Load Average",
      os: "Operating System",
      arch: "Architecture",
      total_mem: "Total RAM",
      avail_mem: "Available RAM",
      total_disk: "Total Disk Space",
      avail_disk: "Available Disk Space",
    },
    common: {
      actions: "Actions",
      delete: "Delete",
    },
  },
  ua: {
    nav: {
      dashboard: "Дашборд",
      views: "Огляд",
      resources: "Ресурси",
      campaigns: "Кампанії",
      events: "Трекінг подій",
      tags: "Тег Менеджер",
      settings: "Налаштування",
      analytics: "Аналітика",
      live: "Live-режим",
      customAnalytics: "Звіти",
      heatmaps: "Теплові карти",
      explorer: "Live Провідник",
      funnels: "Воронки конверсій",
      retention: "Утримання (Когорти)",
      segments: "Сегменти поведінки",
      timeline: "Хронологія користувача",
      docs: "Документація API",
      signIn: "Увійти",
      features: "Можливості",
      modules: "Модулі",
      users: "Команда",
      monitor: "Моніторинг",
      groups: {
        analytics: "Аналітика",
        tracking: "Збір даних",
        system: "Налаштування",
      },
    },
    hero: {
      tag: "Self-Hosted • Приватність",
      title: "Володійте даними аналітики.",
      subtitle:
        "Потужна альтернатива Google Analytics з відкритим кодом. Відстежуйте все без компромісів.",
      ctaPrimary: "Почати",
      ctaSecondary: "GitHub",
      help: {
        title: "Ласкаво просимо в OpenTrace",
        content:
          "OpenTrace — це аналітична платформа нового покоління. Ви можете використовувати її для відстеження сайтів, мобільних додатків та Telegram-ботів. Всі дані обробляються в реальному часі та залишаються на вашій інфраструктурі.",
      },
    },
    dashboard: {
      title: "Огляд продуктивності",
      subtitle: "Моніторинг трафіку в реальному часі",
      stats: {
        visitors: "Загалом відвідувачів",
        views: "Перегляди сторінок",
        session: "Сер. сесія",
        bounce: "Показник відмов",
      },
      activityVolume: "Обсяг активності",
      chartLabels: {
        now: "Зараз",
        h6: "6г тому",
        h12: "12г тому",
        h18: "18г тому",
        h24: "24г тому",
      },
      help: {
        title: "Про Дашборд",
        content:
          "Дашборд надає загальний огляд вашої інфраструктури. Тут ви можете відстежувати трафік у реальному часі, коефіцієнти конверсії та стан підключених ресурсів.",
      },
    },
    resources: {
      title: "Ваші ресурси",
      subtitle: "Керування вашими сайтами та ботами",
      add: "Додати ресурс",
      help: {
        title: "Керування ресурсами",
        content:
          "Ресурси — це основа вашого трекінгу. Додайте сюди ваші сайти, боти або додатки, щоб отримати унікальний Tracking ID. Наш SDK (v1.1) автоматично відстежує кліки, відправку форм, тривалість сесії та глибину скролу. Також він захоплює маркетингові ID (FBCLID/TTCLID) для точного серверного відстеження конверсій (CAPI).",
      },
      table: {
        name: "Назва ресурсу",
        type: "Тип",
        id: "Внутрішній ID",
        status: "Статус",
      },
      types: {
        website: "Веб-сайт",
        bot: "Telegram Бот",
        app: "Мобільний додаток",
      },
      fields: {
        name: "Назва",
        type: "Тип ресурсу",
        token: "Токен бота",
        bundleId: "Bundle ID додатка",
        url: "URL сайту",
      },
    },
    campaigns: {
      title: "Посилання кампаній",
      subtitle: "UTM-мітки та глибокі посилання для ботів",
      create: "Створити посилання",
      help: {
        title: "Трекінг кампаній",
        content:
          "Створюйте відстежувані посилання для вашої реклами. Використовуйте UTM-генератор для сайтів або deep-link генератор для ботів, щоб точно знати, яке джерело привело користувача.",
      },
      table: {
        source: "Джерело",
        medium: "Канал",
        campaign: "Кампанія",
        clicks: "Кліки",
        conversion: "Конв. %",
      },
    },
    events: {
      title: "Трекінг подій",
      subtitle: "Налаштування кліків, переглядів та кастомних дій",
      add: "Додати подію",
      help: {
        title: "Регулювання подій",
        content:
          "Налаштуйте, які дії відстежувати. Визначайте ключові події, такі як кліки або відправка форм. Ці події служать не лише для аналітики, а й як тригери для серверної передачі конверсій (CAPI) у Facebook, TikTok та інші сервіси.",
      },
      table: {
        name: "Назва події",
        trigger: "Тип тригера",
        source: "Цільовий ресурс",
        count: "Всього спрацювань",
      },
      botUTM: {
        title: "Конструктор UTM для Telegram",
        subtitle:
          "Генеруйте deep-link з унікальною міткою на 12 символів для відстеження підписок.",
        botUsername: "Юзернейм бота (@)",
        source: "Джерело трафіку",
        medium: "Канал (Medium)",
        campaign: "Назва кампанії",
        generate: "Згенерувати посилання",
        yourLink: "Ваш Deep-Link",
        copy: "Копіювати",
        snippet: "Приклад інтеграції",
        close: "Закрити конструктор",
      },
    },
    tags: {
      title: "Тег Менеджер",
      subtitle: "Керування пікселями та метриками без коду",
      add: "Додати тег",
      help: {
        title: "Керування тегами",
        content:
          "Керуйте сторонньою аналітикою (FB Pixel, GA4) в одному місці. Додайте контейнер OpenTrace на сайт один раз, і вмикайте/вимикайте інші скрипти без редагування коду.",
      },
      table: {
        name: "Назва тегу",
        provider: "Провайдер",
        active: "Активний",
      },
      snippet: {
        title: "Єдиний код відстеження",
        description:
          "Якщо ви вже встановили основний код відстеження для цього ресурсу, жодних додаткових скриптів не потрібно. Ваші теги будуть автоматично синхронізовані та інтегровані на ваш сайт.",
      },
    },
    settings: {
      title: "Конфігурація системи",
      subtitle: "Керуйте своїм аналітичним простором",
      general: "Загальні налаштування",
      generalDesc: "Назва робочого простору та візуальні вподобання",
      api: "Ключі API",
      apiDesc: "Ключі для автентифікації у ваших додатках",
      security: {
        title: "Логін та Безпека",
        desc: "Керування ідентифікацією та видимістю",
        adminEmail: "Email адміністратора",
        update: "Оновити Email",
        showDemo: "Показувати демо-дані",
        showDemoDesc: "Відображати симуляцію даних, якщо ресурс порожній",
        skipLanding: "Пропускати лендінг",
        skipLandingDesc: "Перенаправляти відразу на вхід замість головної",
        resetPassword: "Надіслати посилання на скидання паролю",
      },
      language: "Мова інтерфейсу",
      workspaceName: "Назва простору",
      ingestionKey: "Ключ Ingestion",
      rotate: "Оновити",
      viewDocs: "Переглянути документацію API",
      appearance: "Зовнішній вигляд",
      appearanceDesc: "Тема інтерфейсу та вподобання",
      help: {
        title: "Налаштування системи",
        content:
          "Налаштовуйте свій робочий простір, керуйте ключами доступу API для розробників та змінюйте мову інтерфейсу.",
      },
      checkUpdate: "Перевірити оновлення",
      upToDate: "Система оновлена",
      logs: {
        title: "Системні логи",
        subtitle: "Записи в реальному часі з ClickHouse",
        level: "Рівень",
        module: "Модуль",
        message: "Повідомлення",
        time: "Час",
      },
      security: {
        title: "Безпека та Доступ",
        desc: "Керування адмін-акаунтом та сторінкою входу",
        adminEmail: "Email Адміністратора",
        update: "Оновити",
        showDemo: "Показувати Demo-дані",
        showDemoDesc: "Відображати дані для входу на сторінці логіну",
        skipLanding: "Пропускати лендінг",
        skipLandingDesc: "Перенаправляти відразу на вхід замість головної",
        resetPassword: "Відновити пароль",
        resetSuccess: "Посилання для скидання надіслано на пошту",
      },
      smtp: {
        title: "Налаштування SMTP",
        desc: "Конфігурація поштового сервера для відновлення паролів",
        host: "SMTP Хост",
        port: "Порт",
        user: "Користувач",
        pass: "Пароль",
        from: "Email відправника",
        save: "Зберегти налаштування SMTP",
      },
      backup: {
        title: "Резервне копіювання",
        desc: "Створення повних знімків бази даних та телеметрії",
        create: "Створити копію",
        history: "Історія бекапів",
        restore: "Відновити",
        restoreConfirm:
          "УВАГА: Це перезапише поточну базу даних вибраним бекапом. Продовжити?",
        size: "Розмір",
        date: "Дата",
        noBackups: "Бекапів не знайдено.",
      },
      updates: {
        title: "Керування оновленнями",
        desc: "Підтримуйте систему в актуальному стані",
        current: "Поточна версія",
        latest: "Остання версія",
        stable: "Ви використовуєте останню версію",
        newAvailable: "Доступна нова версія",
        install: "Встановити оновлення",
        installing: "Встановлення...",
        confirmTitle: "Оновлення системи",
        confirmMsg:
          "Ви впевнені, що хочете розпочати оновлення? Контейнери будуть перезібрані, що спричинить коротку перерву в роботі.",
        backupWarning:
          "Рекомендація: Зробіть резервну копію бази даних перед початком.",
        status: "Статус системи",
        installSuccess: "Процес оновлення запущено!",
      },
    },
    integration: {
      title: "Інтеграція",
      subtitle: "Додайте цей код на свій сайт",
      copy: "Копіювати код",
      desc: "Вставте цей скрипт перед закриваючим тегом </head> вашого сайту.",
    },
    modules: {
      title: "Магазин модулів",
      subtitle: "Розширюйте OpenTrace спеціалізованими плагінами.",
      activate: "Активація модуля",
      keyPlaceholder: "Вставте ключ ліцензії або код...",
      status: {
        installed: "Встановлено",
        available: "Доступно",
        premium: "Преміум",
      },
    },
    analytics: {
      trackedEvents: {
        title: "Відстежувані події",
        empty: "За цей період подій не зафіксовано.",
      },
      trafficSources: "Джерела трафіку",
      osBreakdown: "Операційні системи",
      browserBreakdown: "Браузери",
      deviceBreakdown: "Типи пристроїв",
      topReferrers: "Джерела (Referrers)",
      eventType: "Тип події",
      title: "Аналітика",
      subtitle: "Аналізуйте результати за допомогою детальних фільтрів.",
      filters: "Розширені фільтри",
      apply: "Застосувати",
      help: {
        title: "Аналітика",
        content:
          "Використовуйте цей розділ для сегментації трафіку. Фільтри дозволяють фокусуватися на конкретних джерелах, девайсах або періодах.",
      },
      metrics: {
        visitors: "Відвідувачі",
        views: "Перегляди",
        conv: "Конверсія",
        arpu: "ARPU",
        cac: "CAC",
        roi: "ROI",
      },
      dateRange: "Період",
      startDate: "Дата початку",
      endDate: "Дата завершення",
      trafficSource: "Джерело трафіку",
      deviceType: "Тип пристрою",
      allSources: "Всі джерела",
      direct: "Прямий захід",
      googleAds: "Google Ads",
      facebook: "Facebook",
      allDevices: "Всі пристрої",
      mobile: "Мобільні",
      desktop: "Десктоп",
      live: {
        title: "Активність наживо",
        subtitle: "Розподіл користувачів у реальному часі",
        online: "Онлайн зараз",
        map: "Глобальна присутність",
        recent: "Останні події",
        waiting: "Очікуємо на події...",
      },
    },
    reports: {
      title: "Кастомні звіти",
      subtitle: "Створюйте та зберігайте власні візуалізації даних.",
      create: "Створити звіт",
      builder: "Конструктор звітів",
      select: "Вибрати звіт",
      metric: "Основна метрика",
      dimension: "Розріз даних",
      period: "Період аналізу",
      save: "Зберегти звіт",
      adhoc: "Запустити",
      metrics: {
        users: "Унікальні користувачі",
        sessions: "Всього сесій",
        events: "Всього подій",
      },
      dimensions: {
        date: "Хронологія (Дата)",
        source: "Джерело трафіку",
        country: "Географія (Країна)",
        device: "Тип пристрою",
        event_name: "Назва події",
      },
      help: {
        title: "Кастомна звітність",
        content:
          "Секція для створення персоналізованих графіків. Вибирайте будь-яку метрику та поєднуйте її з потрібним виміром для глибокого аналізу трафіку.",
      },
    },
    custom: {
      title: "Конструктор звітів",
      subtitle: "Створюйте власні візуальні дашборди.",
      create: "Створити звіт",
      help: {
        title: "Кастомна аналітика",
        content:
          "Проектуйте власні віджети візуалізації. Підключайтеся до сирих даних та створюйте власні KPI.",
      },
    },
    auth: {
      title: "Доступ до системи",
      email: "Електронна пошта",
      password: "Токен безпеки",
      submit: "Авторизуватися",
      help: {
        title: "Доступ до системи",
        content:
          "Використовуйте свої облікові дані адміністратора для доступу до панелі керування. Дефолтні дані: admin@opentrace.io / admin.",
      },
    },
    features_block: {
      tracking: "Універсальний трекінг",
      trackingDesc:
        "Відстежуйте взаємодії на будь-якій платформі — сайтах, додатках або API.",
      realtime: "Миттєва обробка",
      realtimeDesc:
        "Побудовано на ClickHouse для швидких інсайтів без затримок.",
      ownership: "Власні дані",
      ownershipDesc:
        "Ваші дані залишаються на вашій інфраструктурі. Ви володієте ними на 100%.",
    },
    footer: {
      copyright: "© 2025 OpenTrace Analytics",
    },
    landing: {
      nav: {
        features: "Можливості",
        opensource: "Open Source",
        modules: "Модулі",
      },
      hero: {
        badge: "Self-Hosted • Приватність • Open Source",
        title: "Володійте своїми даними",
        subtitle:
          "Потужна альтернатива Google Analytics з відкритим кодом. Відстежуйте все без компромісів для приватності. Розгорніть на своїй інфраструктурі за хвилини.",
        cta: "Почати безкоштовно",
        github: "Переглянути на GitHub",
      },
      stats: {
        opensource: "Open Source",
        languages: "Мови",
        events: "Подій на секунду",
      },
      features: {
        title: "Все, що потрібно",
        subtitle:
          "Потужна аналітична платформа з корпоративними функціями, створена для приватності та продуктивності.",
        analytics: {
          title: "Просунута аналітика",
          desc: "Глибокі інсайти з кастомними фільтрами, воронками та відстеженням конверсій. Аналізуйте поведінку користувачів у всіх точках дотику.",
        },
        live: {
          title: "Моніторинг в реальному часі",
          desc: "Спостерігайте за взаємодією користувачів у реальному часі. Карти в реальному часі, активні сесії та миттєві потоки подій.",
        },
        campaigns: {
          title: "Відстеження кампаній",
          desc: "Відстежуйте UTM-параметри, глибокі посилання та атрибуцію. Дізнайтеся точно, які кампанії приносять результати.",
        },
        realtime: {
          title: "Блискавична швидкість",
          desc: "Побудовано на ClickHouse для миттєвих запитів. Обробляйте мільйони подій на секунду без зусиль.",
        },
        privacy: {
          title: "Приватність на першому місці",
          desc: "Відповідає GDPR за задумом. Без cookies, без скриптів відстеження, без обміну даними. Приватність ваших користувачів захищена.",
        },
        modules: {
          title: "Розширювана платформа",
          desc: "Розширюйте функціонал за допомогою модулів. Теплові карти, A/B тестування, запис сесій та багато іншого доступно в маркетплейсі.",
        },
      },
      opensource: {
        badge: "100% Open Source",
        title: "Створено спільнотою, для спільноти",
        desc: "OpenTrace повністю відкритий під ліцензією MIT. Без прив'язки до постачальника, без прихованих витрат, без компромісів. Форкніть, змінюйте, зробіть своїм.",
        freedom: "Повна свобода змінювати та поширювати",
        community: "Активна спільнота контриб'юторів",
        transparency: "Прозорий процес розробки",
        extensible: "Плагін-архітектура для кастомних функцій",
        cta: "Поставити зірку на GitHub",
      },
      modules: {
        title: "Розширте модулями",
        desc: "Відкрийте просунуті функції за допомогою нашого маркетплейсу плагінів та розширень. Від теплових карт до AI-інсайтів.",
        heatmaps: {
          title: "Теплові карти та записи",
          desc: "Візуалізуйте кліки, прокрутку та сесії користувачів",
        },
        ab_testing: {
          title: "A/B тестування",
          desc: "Проводьте експерименти та оптимізуйте конверсії",
        },
        funnels: {
          title: "Просунуті воронки",
          desc: "Багатоетапний аналіз конверсій",
        },
        attribution: {
          title: "Моделі атрибуції",
          desc: "Багатоканальна атрибуція та відстеження ROI",
        },
        cta: "Переглянути модулі",
      },
      languages: {
        title: "Розмовляйте своєю мовою",
        desc: "OpenTrace підтримує англійську, українську, польську та німецьку мови. Більше мов незабаром.",
      },
      cta: {
        title: "Готові взяти контроль?",
        desc: "Приєднуйтеся до тисяч компаній, які використовують OpenTrace для розуміння своїх користувачів, поважаючи їхню приватність.",
        button: "Почати відстеження",
      },
      footer: {
        tagline: "Аналітика з пріоритетом приватності для сучасних команд",
        product: "Продукт",
        resources: "Ресурси",
        community: "Спільнота",
      },
      stats_block: {
        speed: "Швидкість запитів",
        integrity: "Цілісність даних",
        scalability: "Масштабованість",
        events: "Мільярди подій"
      },
      tech_stack: {
        title: "Побудовано для масштабу",
        subtitle: "Розроблено з використанням найсучаснішого технічного стеку для забезпечення стабільності та швидкості.",
        fastapi: {
          title: "Двигун FastAPI",
          desc: "Асинхронне ядро, що обробляє тисячі запитів на секунду з мінімальними затримками."
        },
        clickhouse: {
          title: "Сховище ClickHouse",
          desc: "Найшвидша у світі колонкова база даних для аналітичних задач та звітів у реальному часі."
        },
        nextjs: {
          title: "Інтерфейс Next.js",
          desc: "Адаптивний та сучасний фронтенд, побудований на новітніх паттернах React для плавної роботи."
        }
      },
      enterprise: {
        tier: "Tier-1 Інфраструктура",
        dashboards: "Кастомні дашборди",
        retention: "Безлімітне зберігання",
        security: "Захищена архітектура",
        api: "Доступ до API"
      }
    },
    forgot_password: {
      title: "Відновлення паролю",
      desc: "Введіть email для отримання посилання.",
      email: "Електронна пошта",
      submit: "Надіслати посилання",
      back: "Назад до входу",
      new_pass_title: "Встановити новий пароль",
      new_pass: "Новий пароль",
      confirm_pass: "Підтвердити пароль",
      reset_btn: "Змінити пароль",
      success: "Пароль успішно змінено!",
    },
    auth: {
      title: "Авторизація",
      subtitle: "Увійдіть до панелі керування",
      email: "Електронна пошта",
      password: "Ваш пароль",
      submit: "Увійти",
      login_failed: "Помилка входу",
      invalid_credentials: "Невірні дані",
      forgot_link: "Забули пароль?",
      login: {
        title: "Авторизація",
        subtitle: "Увійдіть до панелі керування",
        email: "Електронна пошта",
        password: "Ваш пароль",
        submit: "Увійти",
        forgot: "Забули пароль?",
      },
    },
    profile: {
      title: "Налаштування профілю",
      alert_first_login:
        "Попередження безпеки: Ви використовуєте тимчасовий пароль. Будь ласка, змініть його.",
      change_password: "Змінити пароль",
      current: "Поточний пароль",
      new: "Новий пароль",
      confirm: "Підтвердити новий пароль",
      submit: "Оновити пароль",
      success: "Пароль успішно змінено!",
      mismatch: "Паролі не співпадають",
      logged_in_as: "Ви увійшли як",
    },
    modals: {
      delete_confirm: "Підтвердження видалення",
      delete_message: "Введіть пароль адміністратора для видалення.",
      admin_password: "Пароль адміністратора",
      cancel: "Скасувати",
      delete: "Видалити",
    },
    funnels: {
      title: "Воронки конверсій",
      subtitle: "Аналіз шляхів користувачів та відтоку",
      help: {
        title: "Аналітика воронок",
        content:
          "Воронка — це послідовність кроків, які робить користувач для досягнення цілі. Тут ви можете відстежувати конверсію між етапами, знаходити точки відтоку та бачити середній час переходу.",
      },
      create: "Створити воронку",
      builder: "Конструктор воронки",
      compare: "Порівняти воронки",
      stats: {
        conversion: "Конверсія",
        dropoff: "Відтік",
        ttc: "Час до конверсії",
        sessions: "Всього сесій",
        steps: "Кроки",
      },
      fields: {
        name: "Назва воронки",
        stepName: "Назва кроку",
        type: "Тип тригера",
        value: "Значення (URL або подія)",
        stepValue: "Цінність ($)",
        isGoal: "Ціль?",
      },
    },
    retention: {
      title: "Утримання та Когорти",
      subtitle: "Показники повернення користувачів протягом 30 днів",
      cohort: "Когорта",
      size: "Розмір",
      day: "День",
      percentage: "Відсотки",
      absolute: "Абсолютно",
      help: {
        title: "Когортний аналіз",
        content:
          "Когортний аналіз групує користувачів за датою їхнього першого візиту та відстежує, скільки з них повертаються протягом наступних 30 днів. Високе утримання — найкращий показник відповідності продукту ринку та довгострокової цінності користувачів.",
      },
    },
    segments: {
      title: "Сегменти поведінки",
      subtitle: "Створюйте динамічні групи користувачів на основі дій",
      create: "Новий сегмент",
      builder: "Конструктор сегментів",
      name: "Назва сегмента",
      logic: "Логіка",
      addCondition: "Додати умову",
      addGroup: "Додати групу",
      preview: "Попередній перегляд",
      matches: "користувачів відповідають сегменту",
      help: {
        title: "Просунута сегментація",
        content:
          "Сегменти дозволяють фільтрувати користувачів за їхньою поведінкою. Наприклад, ви можете знайти тих, хто 'Відкрив додаток', але 'Не здійснив покупку' протягом 3 днів.",
      },
    },
    timeline: {
      title: "Хронологія користувача",
      subtitle: "Повний потік подій для конкретного ідентифікатора",
      searchPlaceholder: "Введіть user_id або session_id...",
      noIdentity: "Будь ласка, введіть ідентифікатор для перегляду хронології",
      eventContext: "Контекст події",
      properties: "Властивості",
      noEvents: "Подій для цього користувача не знайдено",
      help: {
        title: "Аналіз хронології",
        content:
          "Timeline надає детальний перегляд кожної дії конкретного користувача. Використовуйте це для дебагу, розуміння шляхів конверсії або підготовки до продажів.",
      },
    },
    users_page: {
      title: "Керування командою",
      subtitle: "Запрошуйте та керуйте членами вашої команди",
      invite_title: "Запросити учасника",
      email_label: "Email адреса",
      send_btn: "Надіслати запрошення",
      loading: "Надсилання...",
      success: "Запрошення успішно надіслано!",
      placeholder: "colleague@company.com",
      footer_note:
        "На вказану пошту буде надіслано лист із посиланням для створення акаунту.",
    },
    monitor: {
      title: "Моніторинг ресурсів",
      subtitle: "Стан інфраструктури та продуктивність сервера",
      cpu: "Навантаження CPU",
      memory: "Пам'ять (RAM)",
      disk: "Дисковий простір",
      uptime: "Час роботи",
      load_avg: "Середнє навантаження",
      os: "Операційна система",
      arch: "Архітектура",
      total_mem: "Всього RAM",
      avail_mem: "Доступно RAM",
      total_disk: "Всього на диску",
      avail_disk: "Вільно на диску",
    },
    common: {
      actions: "Дії",
      delete: "Видалити",
    },
  },
  pl: {
    nav: {
      dashboard: "Panel",
      views: "Widok ogólny",
      resources: "Zasoby",
      campaigns: "Linki kampanii",
      events: "Śledzenie zdarzeń",
      tags: "Menedżer tagów",
      settings: "Ustawienia",
      users: "Zespół",
      modules: "Moduły",
      analytics: "Eksplorator",
      funnels: "Lejki konwersji",
      live: "Widok Live",
      customAnalytics: "Raporty",
      docs: "Dokumentacja API",
      signIn: "Zaloguj się",
      features: "Funkcje",
      modules: "Moduły",
      groups: {
        analytics: "Wnioski",
        tracking: "Zbieranie danych",
        system: "Konfiguracja",
      },
    },
    hero: {
      tag: "Self-Hosted • Prywatność",
      title: "Własne dane analityczne.",
      subtitle:
        "Potężna alternatywa dla Google Analytics z otwartym kodem źródłowym. Śledź wszystko bez narażania prywatności.",
      ctaPrimary: "Rozpocznij",
      ctaSecondary: "Zobacz na GitHub",
      help: {
        title: "Witamy w OpenTrace",
        content:
          "OpenTrace to platforma analityczna nowej generacji. Możesz jej używać do śledzenia stron, aplikacji mobilnych i botów Telegram. Wszystkie dane są przetwarzane w czasie rzeczywistym i pozostają na Twojej infrastrukturze.",
      },
    },
    dashboard: {
      title: "Przegląd wydajności",
      subtitle: "Monitorowanie ruchu w czasie rzeczywistym",
      stats: {
        visitors: "Suma wizyt",
        views: "Odsłony",
        session: "Śr. sesja",
        bounce: "Współczynnik odrzuceń",
      },
      help: {
        title: "O Panelu",
        content:
          "Panel zapewnia ogólny widok całej infrastruktury. Tutaj możesz śledzić ruch w czasie rzeczywistym, współczynniki konwersji i stan podłączonych zasobów.",
      },
    },
    resources: {
      title: "Twoje zasoby",
      subtitle: "Zarządzaj swoimi stronami i botami",
      add: "Dodaj zasób",
      help: {
        title: "Zarządzanie zasobami",
        content:
          "Zasoby są rdzeniem Twojego śledzenia. Dodaj tutaj swoje strony lub boty Telegram, aby otrzymać unikalny identyfikator śledzenia (Tracking ID).",
      },
      table: {
        name: "Nazwa zasobu",
        type: "Typ",
        id: "Wewnętrzne ID",
        status: "Status",
      },
      types: {
        website: "Strona internetowa",
        bot: "Bot Telegram",
        app: "Aplikacja mobilna",
      },
      fields: {
        name: "Nazwa",
        type: "Typ zasobu",
        token: "Token bota",
        bundleId: "Bundle ID aplikacji",
        url: "URL strony",
      },
    },
    campaigns: {
      title: "Linki kampanii",
      subtitle: "Tagi UTM i deep-linki dla botów",
      create: "Utwórz link",
      help: {
        title: "Śledzenie kampanii",
        content:
          "Twórz śledzone linki dla swoich reklam. Używaj generatora UTM dla stron lub generatora deep-linków dla botów Telegram.",
      },
      table: {
        source: "Źródło",
        medium: "Medium",
        campaign: "Kampania",
        clicks: "Kliknięcia",
        conversion: "Konw. %",
      },
    },
    events: {
      title: "Śledzenie zdarzeń",
      subtitle: "Definiuj kliknięcia, widoki i akcje",
      add: "Dodaj zdarzenie",
      help: {
        title: "Regulacja zdarzeń",
        content:
          "Skonfiguruj, jakie akcje śledzić. Możesz zdefiniować kliknięcia przycisków lub wizyty na stronie jako kluczowe zdarzenia.",
      },
      table: {
        name: "Nazwa zdarzenia",
        trigger: "Typ wyzwalacza",
        source: "Zasób docelowy",
        count: "Suma trafień",
      },
      botUTM: {
        title: "Konstruktor UTM dla Telegrama",
        subtitle:
          "Generuj deep-link z unikalnym 12-znakowym symbolem do śledzenia subskrypcji.",
        botUsername: "Nazwa bota (@)",
        source: "Źródło ruchu",
        medium: "Kanał (Medium)",
        campaign: "Nazwa kampanii",
        generate: "Generuj link śledzący",
        yourLink: "Twój Deep-Link",
        copy: "Kopiuj",
        snippet: "Fragment integracji",
        close: "Zamknij konstruktor",
      },
    },
    tags: {
      title: "Menedżer tagów",
      subtitle: "Wstrzykuj piksele i metryki bez kodu",
      add: "Dodaj tag",
      help: {
        title: "Zarządzanie tagami",
        content:
          "Zarządzaj analityką zewnętrzną (FB Pixel, GA4) w jednym miejscu.",
      },
      table: {
        name: "Nazwa tagu",
        provider: "Dostawca",
        active: "Aktywny",
      },
      snippet: {
        title: "Standardowy kontener",
        description:
          "Wstaw ten skrypt do <head> swojej strony. Wszystkie aktywne tagi powyżej będą ładowane dynamicznie.",
      },
    },
    settings: {
      title: "Konfiguracja systemu",
      subtitle: "Zarządzaj swoim obszarem analitycznym",
      general: "Ustawienia ogólne",
      generalDesc: "Nazwa obszaru i preferencje wizualne",
      api: "Klucze API",
      apiDesc: "Klucze do uwierzytelniania w Twoich aplikacjach",
      language: "Język interfejsu",
      workspaceName: "Nazwa obszaru",
      ingestionKey: "Klucz Ingestion",
      rotate: "Obróć",
      help: {
        title: "Ustawienia",
        content:
          "Skonfiguruj tutaj globalne preferencje systemu i tokeny bezpieczeństwa.",
      },
      checkUpdate: "Sprawdź aktualizacje",
      upToDate: "System jest aktualny",
    },
    modules: {
      title: "Rynek modułów",
      subtitle: "Rozszerz OpenTrace o specjalistyczne wtyczki.",
      activate: "Aktywuj moduł",
      keyPlaceholder: "Wprowadź klucz licencyjny...",
      status: {
        installed: "Zainstalowano",
        available: "Dostępne",
        premium: "Premium",
      },
    },
    analytics: {
      title: "Eksplorator",
      subtitle: "Analizuj wydajność za pomocą filtrów.",
      filters: "Filtry zaawansowane",
      apply: "Zastosuj",
      help: {
        title: "Eksplorator analityczny",
        content:
          "Użyj tej sekcji, aby filtrować dane o ruchu. Filtry pozwalają skupić się na konkretnych źródłach, urządzeniach lub ramach czasowych.",
      },
      metrics: {
        visitors: "Wizyty",
        views: "Odsłony",
        conv: "Konwersja %",
        arpu: "ARPU",
        cac: "CAC",
        roi: "ROI",
      },
      dateRange: "Zakres dat",
      startDate: "Data początkowa",
      endDate: "Data końcowa",
      trafficSource: "Źródło ruchu",
      deviceType: "Typ urządzenia",
      allSources: "Wszystkie źródła",
      direct: "Bezpośrednie",
      googleAds: "Google Ads",
      facebook: "Facebook",
      allDevices: "Wszystkie urządzenia",
      mobile: "Mobilne",
      desktop: "Desktop",
      live: {
        title: "Aktywność na żywo",
        subtitle: "Dystrybucja użytkowników w czasie rzeczywistym",
        online: "Użytkownicy online",
        map: "Globalna obecność",
        recent: "Ostatnie zdarzenia",
      },
    },
    custom: {
      title: "Kreator raportów",
      subtitle: "Twórz zaawansowane panele wizualne.",
      create: "Utwórz raport",
      help: {
        title: "Własna analityka",
        content: "Projektuj własne widżety wizualizacji.",
      },
    },
    auth: {
      title: "Dostęp do tożsamości",
      email: "Email usługi",
      password: "Token bezpieczeństwa",
      submit: "Uwierzytelnij",
      help: {
        title: "Dostęp",
        content:
          "Użyj poświadczeń administratora, aby uzyskać dostęp do bezpiecznego obszaru.",
      },
    },
    features_block: {
      tracking: "Uniwersalne śledzenie",
      trackingDesc:
        "Śledź interakcje na dowolnej platformie — stronach, aplikacjach lub API.",
      realtime: "Przetwarzanie w czasie rzeczywistym",
      realtimeDesc: "Oparte na ClickHouse dla błyskawicznych wniosków.",
      ownership: "Suwerenność danych",
      ownershipDesc:
        "Twoje dane pozostają na Twojej infrastrukturze. Własność telemetryczna 100%.",
    },
    footer: {
      copyright: "© 2025 OpenTrace Analytics",
    },
    landing: {
      nav: {
        features: "Funkcje",
        opensource: "Open Source",
        modules: "Moduły",
      },
      hero: {
        badge: "Self-Hosted • Prywatność • Open Source",
        title: "Twoje Dane, Twoja Kontrola",
        subtitle:
          "Potężna alternatywa open-source dla Google Analytics. Śledź wszystko bez naruszania prywatności użytkowników. Wdróż na własnej infrastrukturze w kilka minut.",
        cta: "Zacznij za darmo",
        github: "Zobacz na GitHub",
      },
      stats: {
        opensource: "Open Source",
        languages: "Języki",
        events: "Zdarzeń na sekundę",
      },
      features: {
        title: "Wszystko, czego potrzebujesz",
        subtitle:
          "Potężna platforma analityczna z funkcjami korporacyjnymi, zbudowana dla prywatności i wydajności.",
        analytics: {
          title: "Zaawansowana Analityka",
          desc: "Głębokie wglądy z niestandardowymi filtrami, lejkami i śledzeniem konwersji. Analizuj zachowanie użytkowników.",
        },
        live: {
          title: "Monitoring w czasie rzeczywistym",
          desc: "Obserwuj interakcje użytkowników na żywo. Mapy w czasie rzeczywistym, aktywne sesje i natychmiastowe strumienie zdarzeń.",
        },
        campaigns: {
          title: "Śledzenie Kampanii",
          desc: "Śledź parametry UTM, głębokie linki i atrybucję. Wiedz dokładnie, które kampanie przynoszą wyniki.",
        },
        realtime: {
          title: "Błyskawiczna Prędkość",
          desc: "Zbudowane na ClickHouse dla natychmiastowych zapytań. Przetwarzaj miliony zdarzeń na sekundę bez wysiłku.",
        },
        privacy: {
          title: "Prywatność przede wszystkim",
          desc: "Zgodność z RODO (GDPR). Bez ciasteczek, bez skryptów śledzących, bez udostępniania danych.",
        },
        modules: {
          title: "Rozszerzalna Platforma",
          desc: "Rozszerz funkcjonalność za pomocą modułów. Mapy cieplne, testy A/B, odtwarzanie sesji i więcej.",
        },
      },
      opensource: {
        badge: "100% Open Source",
        title: "Zbudowane przez Społeczność",
        desc: "OpenTrace jest w pełni open-source na licencji MIT. Brak vendor lock-in, brak ukrytych kosztów. Sforkuj, zmodyfikuj, zrób swoim.",
        freedom: "Pełna swoboda modyfikacji i dystrybucji",
        community: "Aktywna społeczność kontrybutorów",
        transparency: "Przejrzysty proces rozwoju",
        extensible: "Architektura wtyczek dla własnych funkcji",
        cta: "Oznacz gwiazdką na GitHub",
      },
      modules: {
        title: "Rozszerz Modułami",
        desc: "Odblokuj zaawansowane funkcje dzięki naszemu rynkowi wtyczek. Od map cieplnych po wglądy AI.",
        heatmaps: {
          title: "Mapy Cieplne i Nagrania",
          desc: "Wizualizuj kliknięcia, przewijanie i sesje",
        },
        ab_testing: {
          title: "Testy A/B",
          desc: "Przeprowadzaj eksperymenty i optymalizuj konwersje",
        },
        funnels: {
          title: "Zaawansowane Lejki",
          desc: "Wieloetapowa analiza konwersji",
        },
        attribution: {
          title: "Modele Atrybucji",
          desc: "Atrybucja wielokanałowa i śledzenie ROI",
        },
        cta: "Przeglądaj Moduły",
      },
      languages: {
        title: "Mówimy w Twoim języku",
        desc: "OpenTrace wspiera angielski, ukraiński, polski i niemiecki od razu po instalacji.",
      },
      cta: {
        title: "Gotowy przejąć kontrolę?",
        desc: "Dołącz do tysięcy firm używających OpenTrace, aby zrozumieć użytkowników, szanując ich prywatność.",
        button: "Rozpocznij Śledzenie",
      },
      footer: {
        tagline: "Analityka privacy-first dla nowoczesnych zespołów",
        product: "Produkt",
        resources: "Zasoby",
        community: "Społeczność",
      },
      stats_block: {
        speed: "Szybkość zapytań",
        integrity: "Integralność danych",
        scalability: "Skalowalność",
        events: "Miliardy zdarzeń"
      },
      tech_stack: {
        title: "Zbudowane dla skali",
        subtitle: "Opracowane przy użyciu najnowocześniejszego stosu technologicznego w celu zapewnienia stabilności i wydajności.",
        fastapi: {
          title: "Silnik FastAPI",
          desc: "Asynchroniczny rdzeń obsługujący tysiące żądań na sekundę przy minimalnym obciążeniu."
        },
        clickhouse: {
          title: "Magazyn ClickHouse",
          desc: "Najszybsza na świecie kolumnowa baza danych do obciążeń analitycznych i raportowania w czasie rzeczywistym."
        },
        nextjs: {
          title: "Interfejs Next.js",
          desc: "Responsive i nowoczesny frontend zbudowany z najnowszych wzorców React dla płynnego doświadczenia."
        }
      },
      enterprise: {
        tier: "Infrastruktura Tier-1",
        dashboards: "Niestandardowe pulpity",
        retention: "Nieskończona retencja danych",
        security: "Bezpieczna architektura",
        api: "Dostęp do API"
      }
    },
  },
  de: {
    nav: {
      dashboard: "Dashboard",
      views: "Übersicht",
      resources: "Ressourcen",
      campaigns: "Kampagnen-Links",
      events: "Event-Tracking",
      tags: "Tag-Manager",
      settings: "Einstellungen",
      users: "Team",
      modules: "Module",
      analytics: "Analyse",
      funnels: "Conversion-Trichter",
      live: "Echtzeit",
      customAnalytics: "Berichte",
      docs: "API-Dokumentation",
      signIn: "Anmelden",
      features: "Funktionen",
      modules: "Module",
      groups: {
        analytics: "Einblicke",
        tracking: "Datenerfassung",
        system: "Konfiguration",
      },
    },
    hero: {
      tag: "Self-Hosted • Privatsphäre",
      title: "Besitzen Sie Ihre Analysedaten.",
      subtitle:
        "Eine leistungsstarke Open-Source-Alternative zu Google Analytics. Tracken Sie alles, ohne die Privatsphäre zu verletzen.",
      ctaPrimary: "Loslegen",
      ctaSecondary: "Auf GitHub ansehen",
      help: {
        title: "Willkommen bei OpenTrace",
        content:
          "OpenTrace ist eine Analyseplattform der nächsten Generation. Sie können damit Websites, mobile Apps und Telegram-Bots tracken.",
      },
    },
    dashboard: {
      title: "Leistungsübersicht",
      subtitle: "Echtzeit-Verkehrsüberwachung",
      stats: {
        visitors: "Besucher gesamt",
        views: "Seitenaufrufe",
        session: "Durchschn. Sitzung",
        bounce: "Absprungrate",
      },
      help: {
        title: "Über das Dashboard",
        content:
          "Das Dashboard bietet einen Überblick über Ihre gesamte Infrastruktur.",
      },
    },
    resources: {
      title: "Ihre Ressourcen",
      subtitle: "Websites und Bots verwalten",
      add: "Ressource hinzufügen",
      help: {
        title: "Ressourcen-Management",
        content: "Ressourcen sind der Kern Ihres Trackings.",
      },
      table: {
        name: "Ressourcenname",
        type: "Typ",
        id: "Interne ID",
        status: "Status",
      },
      types: {
        website: "Website",
        bot: "Telegram-Bot",
        app: "Mobile App",
      },
      fields: {
        name: "Name",
        type: "Ressourcentyp",
        token: "Bot-Token",
        bundleId: "App-Bundle-ID",
        url: "Website-URL",
      },
    },
    campaigns: {
      title: "Kampagnen-Links",
      subtitle: "UTM-Tags und Bot-Deep-Links",
      create: "Link erstellen",
      help: {
        title: "Kampagnen-Tracking",
        content: "Erstellen Sie getrackte Links für Ihre Anzeigen.",
      },
      table: {
        source: "Quelle",
        medium: "Medium",
        campaign: "Kampagne",
        clicks: "Klicks",
        conversion: "Konv. %",
      },
    },
    events: {
      title: "Event-Tracking",
      subtitle: "Klicks, Ansichten und Aktionen definieren",
      add: "Event hinzufügen",
      help: {
        title: "Event-Regulierung",
        content: "Konfigurieren Sie, welche Aktionen getrackt werden sollen.",
      },
      table: {
        name: "Eventname",
        trigger: "Triggertyp",
        source: "Zielressource",
        count: "Treffer gesamt",
      },
      botUTM: {
        title: "Telegram Bot UTM Konstruktor",
        subtitle:
          "Generieren Sie einen Deep-Link mit einem eindeutigen 12-Zeichen-Label, um Bot-Abonnements zu verfolgen.",
        botUsername: "Bot-Benutzername (@)",
        source: "Verkehrsquelle",
        medium: "Medium",
        campaign: "Kampagnenname",
        generate: "Tracking-Link generieren",
        yourLink: "Ihr Deep-Link",
        copy: "Kopieren",
        snippet: "Integrations-Beispiel",
        close: "Konstruktor schließen",
      },
    },
    tags: {
      title: "Tag-Manager",
      subtitle: "Pixel und Metriken ohne Code injizieren",
      add: "Tag hinzufügen",
      help: {
        title: "Tag-Management",
        content: "Verwalten Sie Drittanbieter-Analysen an einem Ort.",
      },
      table: {
        name: "Tag-Name",
        provider: "Anbieter",
        active: "Aktiv",
      },
      snippet: {
        title: "Standard-Container",
        description:
          "Fügen Sie dieses Skript in den <head> Ihrer Website ein. Alle oben aktiven Tags werden dynamisch bereitgestellt.",
      },
    },
    settings: {
      title: "Systemkonfiguration",
      subtitle: "Verwalten Sie Ihren Analyse-Arbeitsbereich",
      general: "Allgemeine Einstellungen",
      generalDesc: "Workspace-Name und visuelle Vorlieben",
      api: "API-Schlüssel",
      apiDesc: "Schlüssel zur Authentifizierung in Ihren Apps",
      language: "Sprache der Benutzeroberfläche",
      workspaceName: "Workspace-Name",
      ingestionKey: "Ingestion-Schlüssel",
      rotate: "Rotieren",
      help: {
        title: "Einstellungen",
        content: "Konfigurieren Sie hier Ihre globalen Systemeinstellungen.",
      },
      checkUpdate: "Auf Updates prüfen",
      upToDate: "System ist aktuell",
    },
    modules: {
      title: "Modul-Marktplatz",
      subtitle: "Erweitern Sie OpenTrace mit Plugins.",
      activate: "Modul aktivieren",
      keyPlaceholder: "Lizenzschlüssel eingeben...",
      status: {
        installed: "Installiert",
        available: "Verfügbar",
        premium: "Premium",
      },
    },
    analytics: {
      title: "Explorer",
      subtitle: "Leistung mit Filtern analysieren.",
      filters: "Erweiterte Filter",
      apply: "Filter anwenden",
      help: {
        title: "Analyse-Explorer",
        content: "Nutzen Sie diesen Bereich, um Verkehrsdaten zu filtern.",
      },
      metrics: {
        visitors: "Besucher",
        views: "Seitenaufrufe",
        conv: "Konversion %",
        arpu: "ARPU",
        cac: "CAC",
        roi: "ROI",
      },
      dateRange: "Zeitraum",
      startDate: "Startdatum",
      endDate: "Enddatum",
      trafficSource: "Verkehrsquelle",
      deviceType: "Gerätetyp",
      allSources: "Alle Quellen",
      direct: "Direkt",
      googleAds: "Google Ads",
      facebook: "Facebook",
      allDevices: "Alle Geräte",
      mobile: "Mobil",
      desktop: "Desktop",
      live: {
        title: "Echtzeit-Aktivität",
        subtitle: "Nutzerverteilung rund um den Globus",
        online: "Jetzt online",
        map: "Globale Präsenz",
        recent: "Letzte Ereignisse",
      },
    },
    custom: {
      title: "Bericht-Baukasten",
      subtitle: "Visuelle Dashboards erstellen.",
      create: "Bericht erstellen",
      help: {
        title: "Benutzerdefinierte Analyse",
        content: "Entwerfen Sie eigene Visualisierungs-Widgets.",
      },
    },
    auth: {
      title: "Identitätszugriff",
      email: "Dienst-E-Mail",
      password: "Sicherheitstoken",
      submit: "Authentifizieren",
      help: {
        title: "Zugriff",
        content: "Verwenden Sie Ihre Administrator-Anmeldedaten.",
      },
    },
    features_block: {
      tracking: "Universelles Tracking",
      trackingDesc: "Tracken Sie Interaktionen auf jeder Plattform.",
      realtime: "Echtzeit-Verarbeitung",
      realtimeDesc: "Basiert auf ClickHouse für sofortige Einblicke.",
      ownership: "Datensouveränität",
      ownershipDesc: "Ihre Daten bleiben auf Ihrer Infrastruktur.",
    },
    footer: {
      copyright: "© 2025 OpenTrace Analytics",
    },
    landing: {
      nav: {
        features: "Funktionen",
        opensource: "Open Source",
        modules: "Module",
      },
      hero: {
        badge: "Self-Hosted • Datenschutz • Open Source",
        title: "Ihre Daten gehören Ihnen",
        subtitle:
          "Eine leistungsstarke Open-Source-Alternative zu Google Analytics. Tracken Sie alles ohne Kompromisse beim Datenschutz. In Minuten auf Ihrer Infrastruktur bereitgestellt.",
        cta: "Kostenlos starten",
        github: "Auf GitHub ansehen",
      },
      stats: {
        opensource: "Open Source",
        languages: "Sprachen",
        events: "Ereignisse pro Sekunde",
      },
      features: {
        title: "Alles was Sie brauchen",
        subtitle:
          "Leistungsstarke Analyseplattform mit Enterprise-Funktionen, gebaut für Datenschutz und Leistung.",
        analytics: {
          title: "Erweiterte Analysen",
          desc: "Tiefe Einblicke mit benutzerdefinierten Filtern, Trichtern und Conversion-Tracking.",
        },
        live: {
          title: "Echtzeit-Überwachung",
          desc: "Beobachten Sie Benutzerinteraktionen in Echtzeit. Live-Karten, aktive Sitzungen und sofortige Event-Streams.",
        },
        campaigns: {
          title: "Kampagnen-Tracking",
          desc: "Verfolgen Sie UTM-Parameter, Deep Links und Attribution. Wissen Sie genau, welche Kampagnen Ergebnisse liefern.",
        },
        realtime: {
          title: "Blitzschnell",
          desc: "Gebaut auf ClickHouse für sofortige Abfragen. Verarbeiten Sie Millionen von Ereignissen pro Sekunde mühelos.",
        },
        privacy: {
          title: "Datenschutz zuerst",
          desc: "DSGVO-konform per Design. Keine Cookies, keine Tracking-Skripte, keine Datenweitergabe.",
        },
        modules: {
          title: "Erweiterbare Plattform",
          desc: "Erweitern Sie die Funktionalität mit Modulen. Heatmaps, A/B-Tests, Sitzungswiedergabe und mehr im Marktplatz.",
        },
      },
      opensource: {
        badge: "100% Open Source",
        title: "Gebaut von der Community",
        desc: "OpenTrace ist vollständig Open Source unter MIT-Lizenz. Kein Vendor Lock-in, keine versteckten Kosten. Forken, anpassen, nutzen.",
        freedom: "Vollständige Freiheit zum Ändern und Verteilen",
        community: "Aktive Community von Mitwirkenden",
        transparency: "Transparenter Entwicklungsprozess",
        extensible: "Plugin-Architektur für eigene Funktionen",
        cta: "Auf GitHub sternen",
      },
      modules: {
        title: "Mit Modulen erweitern",
        desc: "Schalten Sie erweiterte Funktionen mit unserem Marktplatz für Plugins frei. Von Heatmaps bis zu KI-Insights.",
        heatmaps: {
          title: "Heatmaps & Aufnahmen",
          desc: "Visualisieren Sie Klicks, Scrollen und Benutzersitzungen",
        },
        ab_testing: {
          title: "A/B-Tests",
          desc: "Führen Sie Experimente durch und optimieren Sie Conversions",
        },
        funnels: {
          title: "Erweiterte Trichter",
          desc: "Mehrstufige Conversion-Analyse",
        },
        attribution: {
          title: "Attributionsmodelle",
          desc: "Multi-Touch-Attribution und ROI-Tracking",
        },
        cta: "Module durchsuchen",
      },
      languages: {
        title: "Sprechen Sie Ihre Sprache",
        desc: "OpenTrace unterstützt Englisch, Ukrainisch, Polnisch und Deutsch direkt nach der Installation.",
      },
      cta: {
        title: "Bereit, die Kontrolle zu übernehmen?",
        desc: "Schließen Sie sich Tausenden von Unternehmen an, die OpenTrace nutzen, um ihre Benutzer zu verstehen und deren Privatsphäre zu respektieren.",
        button: "Tracking starten",
      },
      footer: {
        tagline: "Datenschutzfreundliche Analyse für moderne Teams",
        product: "Produkt",
        resources: "Ressourcen",
        community: "Community",
      },
      stats_block: {
        speed: "Abfragegeschwindigkeit",
        integrity: "Datenintegrität",
        scalability: "Skalierbarkeit",
        events: "Milliarden+ Ereignisse"
      },
      tech_stack: {
        title: "Für Skalierung gebaut",
        subtitle: "Entwickelt mit dem fortschrittlichsten technischen Stack, um Stabilität und Leistung zu gewährleisten.",
        fastapi: {
          title: "FastAPI Engine",
          desc: "Asynchroner Kern, der Tausende von Anfragen pro Sekunde mit minimalem Overhead verarbeitet."
        },
        clickhouse: {
          title: "ClickHouse Speicher",
          desc: "Die weltweit schnellste spaltenorientierte Datenbank für analytische Workloads und Echtzeit-Reporting."
        },
        nextjs: {
          title: "Next.js Oberfläche",
          desc: "Reaktionsschnelles und modernes Frontend, gebaut mit den neuesten React-Mustern für ein flüssiges Erlebnis."
        }
      },
      enterprise: {
        tier: "Tier-1 Infrastruktur",
        dashboards: "Eigene Dashboards",
        retention: "Unendliche Datenspeicherung",
        security: "Sichere Architektur",
        api: "API-Zugriff"
      }
    },
  },
};
