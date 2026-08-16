import React from 'react';

export const HELP_ITEMS = [
    {
        id: 'basic',
        title: 'Basic',
        imagePc: '/assets/images/Help_Basic.webp',
        imageMobile: '/assets/images/Help_Basic_M.webp',
        content: (
            <>
                Sites counter in <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>BLUE</span> indicates no filter applied.
                When any filter is applied the sites counter turns <span style={{ color: '#ff4444', fontWeight: 'bold' }}>RED </span>
                 and a "Clear Filters" option will appear.
            </>
        )
    },
    { id: 'location',
        title: 'Location',
        imagePc: '/assets/images/Help_Location.webp',// Large horizontal image
        imageMobile: '/assets/images/Help_Location_M.webp', // Tall vertical image
        content: 'Use the location menu to center the map on European capitals. A blue pointer will appear on the selected location. The location icon allows you to center the map to the selected city.' },
    { id: 'GPS location',
        title: 'My GPS Location',
        imagePc: '/assets/images/Help_GPSLocation.webp',
        imageMobile: '/assets/images/Help_GPSLocation_M.webp',
        content: 'You have to authorize the app to access your location to use this feature. Use the location icon to center the map on your current position.' },
    { id: 'All Areas',
        title: 'All Areas',
        imagePc: '/assets/images/Help_AllAreas.webp',
        imageMobile: '/assets/images/Help_AllAreas_M.webp',
        content: 'When a "location" is selected the "All Areas" filter will be activated. Select an area to locate "nAPPo sites" arround you' },
    { id: 'categories',
        title: 'Categories',
        imagePc: '/assets/images/Help_Categories.webp',
        imageMobile: '/assets/images/Help_Categories_M.webp',
        content: 'Select a category to filter sites by type: Battle sites, Museums, Monuments, and more...' },
    { id: 'multiplecategories',
        title: 'Multiple Categories',
        imagePc: '/assets/images/Help_Multiple_Categories.webp',
        imageMobile: '/assets/images/Help_Multiple_Categories_M.webp',
        content: 'More than one category can be selected at the same time. The total sites counter will show the total of them. If "Battle sites" are selected with other non battle category, the special filters for battles will be closed.' },
    { id: 'battle_site', 
        title: 'Battle site', 
        imagePc: '/assets/images/Help_BattleSite.webp',
        imageMobile: '/assets/images/Help_BattleSite_M.webp',
        content: 'When "Battle Site" category is selected three additional filters will be activated. "Year", "Commander" and "Acr de Triomphe"' },
    { id: 'year', 
        title: 'All Years', 
        imagePc: '/assets/images/Help_Years.webp',
        imageMobile: '/assets/images/Help_Years_M.webp',
        content: 'The "All Years" filter will show you the battlefields for the selected year. The number in brackets indicates the count of sites available for that year.' },
    { id: 'commanders', 
        title: 'All Commanders', 
        imagePc: '/assets/images/Help_Commanders.webp',
        imageMobile: '/assets/images/Help_Commanders_M.webp',
        content: 'The "All Commanders" filter will show you the battlefields for the selected commander. The number in brackets indicates the count of sites a vailable for that commander.' },
    { id: 'arc', 
        title: 'Arc de Triomphe', 
        imagePc: '/assets/images/Help_Arc.webp',
        imageMobile: '/assets/images/Help_Arc_M.webp',
        content: 'The "Arc de Triomphe" filter show you the battlefields included in the app listed at the Arc de Triomphe in Paris fought during the Napoleonic Wars or fought by Napoleon during the French Revolution Wars.' },
    { id: 'significance', 
        title: 'Stars', 
        imagePc: '/assets/images/Help_Stars.webp',
        imageMobile: '/assets/images/Help_Stars_M.webp',
        content: 'Stars represent the historical importance of the site. Site Pin size increases with significance. Press again the third star and will show all sites.' },
    { id: 'filters', title: 'Filters', image: '/assets/images/filters.webp', content: 'Combine multiple criteria to find specific sites...' },
    { id: 'news', title: 'News', image: '/assets/images/news.webp', content: 'Stay updated with the latest additions to the map...' },
    { id: 'market', title: 'Market', image: '/assets/images/market.webp', content: 'Purchase official prints and books...' },
    { id: 'events', title: 'Events', image: '/assets/images/events.webp', content: 'Reenactments and historical gatherings...' },
    { id: 'calendar', title: 'Calendar', image: '/assets/images/calendar.webp', content: 'Browse events and battles by date...' },
    { id: 'list_mode', title: 'List Mode', image: '/assets/images/list.webp', content: 'Switch to a text-based searchable list of all sites...' },
    { id: 'settings', title: 'Settings', image: '/assets/images/settings.webp', content: 'Configure theme, cluster density, and app behavior...' },
]
