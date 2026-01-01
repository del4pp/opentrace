import React from 'react';

export const getFeatures = (t) => [
    {
        svg: <path d="M3 3v18h18 M18 9l-5.25 5.25-2.625-2.625L5 16" />,
        key: 'analytics',
        title: t('landing.features.analytics.title'),
        desc: t('landing.features.analytics.desc')
    },
    {
        svg: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M12 14v4 M12 6v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41" />,
        key: 'live',
        title: t('landing.features.live.title'),
        desc: t('landing.features.live.desc')
    },
    {
        svg: <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
        key: 'campaigns',
        title: t('landing.features.campaigns.title'),
        desc: t('landing.features.campaigns.desc')
    },
    {
        svg: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
        key: 'realtime',
        title: t('landing.features.realtime.title'),
        desc: t('landing.features.realtime.desc')
    },
    {
        svg: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
        key: 'privacy',
        title: t('landing.features.privacy.title'),
        desc: t('landing.features.privacy.desc')
    },
    {
        svg: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" />,
        key: 'modules',
        title: t('landing.features.modules.title'),
        desc: t('landing.features.modules.desc')
    },
];

export const languages = [
    { code: 'en', label: 'English' },
    { code: 'ua', label: 'Ukrainian' },
    { code: 'pl', label: 'Polish' },
    { code: 'de', label: 'German' }
];

export const stats = [
    { label: 'AGPL v3 License', value: '100% Free' },
    { label: 'ClickHouse', value: 'Instant DB' },
    { label: 'Privacy', value: 'GDPR Ready' }
];
