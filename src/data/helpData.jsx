import React from 'react';

export const HELP_ITEMS = [
    {
        id: 'basic',
        title: 'Basic',
        imagePc: '/assets/images/Help_Basic.webp',
        imageMobile: '/assets/images/Help_Basic_M.webp',
        content: (
            <>
                Sites counter numbers in <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>BLUE</span> indicates no filter applied.
                When any filter is applied the sites counter turns <span style={{ color: '#ff4444', fontWeight: 'bold' }}>RED </span>
                and a "Clear Filters" option will appear.
            </>
        )
    },
    {
        id: 'sitePin',
        title: 'Site Pin',
        imagePc: '/assets/images/Help_Pin.webp',// Large horizontal image
        imageMobile: '/assets/images/Help_Pin_M.webp', // Tall vertical image
        content: 'When you click a site pin a site card opens. Click on "Details" and a new card opens with a brief description and additional external links to get more information. Pins are coloured base on the category of the site.'
    },
    {
        id: 'related',
        title: 'Related Sites',
        imagePc: '/assets/images/Help_Related.webp',// Large horizontal image
        imageMobile: '/assets/images/Help_Related_M.webp', // Tall vertical image
        content: 'At the bottom of some of the site cards you can find links to other sites related to the event described in such site card.'
    },
    {
        id: 'clusterPin',
        title: 'Cluster Pin',
        imagePc: '/assets/images/Help_ClusterPin.webp',// Large horizontal image
        imageMobile: '/assets/images/Help_ClusterPin_M.webp', // Tall vertical image
        content: 'The number in it indicates the quantity of sites in the cluster. Click on a cluster to zoom in and see the sites individually.'
    },
    {
        id: 'location',
        title: 'Location',
        imagePc: '/assets/images/Help_Location.webp',// Large horizontal image
        imageMobile: '/assets/images/Help_Location_M.webp', // Tall vertical image
        content: 'Use the location menu to center the map on European capitals. A blue pointer will appear on the selected location. The location icon allows you to center the map to the selected city.'
    },
    {
        id: 'GPS location',
        title: 'My GPS Location',
        imagePc: '/assets/images/Help_GPSLocation.webp',
        imageMobile: '/assets/images/Help_GPSLocation_M.webp',
        content: 'You have to authorize the app to access your location to use this feature. Use the location icon to center the map to your current position.'
    },
    {
        id: 'All Areas',
        title: 'All Areas',
        imagePc: '/assets/images/Help_AllAreas.webp',
        imageMobile: '/assets/images/Help_AllAreas_M.webp',
        content: 'When a "location" is selected the "All Areas" filter will be activated. Select an area to locate "nAPPo sites" arround you'
    },
    {
        id: 'categories',
        title: 'Categories',
        imagePc: '/assets/images/Help_Categories.webp',
        imageMobile: '/assets/images/Help_Categories_M.webp',
        content: 'Select a category to filter sites by type: Battle sites, Museums, Monuments, and more...'
    },
    {
        id: 'multiplecategories',
        title: 'Multiple Categories',
        imagePc: '/assets/images/Help_Multiple_Categories.webp',
        imageMobile: '/assets/images/Help_Multiple_Categories_M.webp',
        content: 'More than one category can be selected at the same time. The total sites counter will show the total of them. If "Battle sites" are selected with other non battle category, the special filters for battles will be closed.'
    },
    {
        id: 'battle_site',
        title: 'Battle site',
        imagePc: '/assets/images/Help_BattleSite.webp',
        imageMobile: '/assets/images/Help_BattleSite_M.webp',
        content: 'When "Battle Site" category is selected three additional filters will be activated. "Year", "Commander" and "Acr de Triomphe. Also works for "Naval Battle".'
    },
    {
        id: 'year',
        title: 'All Years',
        imagePc: '/assets/images/Help_Years.webp',
        imageMobile: '/assets/images/Help_Years_M.webp',
        content: 'The "All Years" filter will show you the battlefields for the selected year. The number in brackets indicates the count of sites available for that year.'
    },
    {
        id: 'commanders',
        title: 'All Commanders',
        imagePc: '/assets/images/Help_Commanders.webp',
        imageMobile: '/assets/images/Help_Commanders_M.webp',
        content: 'The "All Commanders" filter will show you the battlefields for the selected commander. The number in brackets indicates the count of sites available for that commander.'
    },
    {
        id: 'arc',
        title: 'Arc de Triomphe',
        imagePc: '/assets/images/Help_Arc.webp',
        imageMobile: '/assets/images/Help_Arc_M.webp',
        content: 'The "Arc de Triomphe" filter show you the battlefields included in the app listed at the Arc de Triomphe in Paris fought during the Napoleonic Wars or fought by Napoleon during the French Revolution Wars. Also the site pin rim for such battles is yellow to differentiate them from the rest.'
    },
    {
        id: 'significance',
        title: 'Stars',
        imagePc: '/assets/images/Help_Stars.webp',
        imageMobile: '/assets/images/Help_Stars_M.webp',
        content: 'Stars represent the historical importance of the site. Site Pin size increases with significance. Press again the selected star and will show all sites.'
    },
    {
        id: 'filters',
        title: 'Filters',
        imagePc: '/assets/images/Help_Filters.webp',
        imageMobile: '/assets/images/Help_Filters_M.webp',
        content: (
            <>
                The Filters button opens a drawer where you can combine multiple criteria to find specific sites. The "Reset All" option will clear all active filters.
                When any filter is applied the "Filters" tag turns <span style={{ color: '#ff4444', fontWeight: 'bold' }}>RED </span>
                and a <span style={{ color: '#ff4444', fontWeight: 'bold' }}>"Clear" </span> tag will also appear.
            </>
        )
    },
    {
        id: 'settings',
        title: 'Settings',
        imagePc: '/assets/images/Help_Settings.webp',
        imageMobile: '/assets/images/Help_Settings_M.webp',
        content: 'Settings allow you to configure theme, map style and site markers cluster density.'
    },
    {
        id: 'theme',
        title: 'Settings - Theme',
        imagePc: '/assets/images/Help_Theme.webp',
        imageMobile: '/assets/images/Help_Theme_M.webp',
        content: 'Theme in the Settings drawer allows you to toggle between Day Mode and Night Mode visual appearances. Night mode will show header and nemus in black.'
    },
    {
        id: 'mapstyle',
        title: 'Settings - Map Style',
        imagePc: '/assets/images/Help_Map_Style.webp',
        imageMobile: '/assets/images/Help_Map_Style_M.webp',
        content: 'The Map Style in the Settings drawer allows you to select among three different styles.'
    },
    {
        id: 'mapcluster',
        title: 'Settings - Map Clustering',
        imagePc: '/assets/images/Help_Cluster.webp',
        imageMobile: '/assets/images/Help_Cluster_M.webp',
        content: '"Map Clustering" allows you to group site markers defining the cluster density. The lowest the value the less clustered the markers will be.'
    },
    {
        id: 'news',
        title: 'News',
        imagePc: '/assets/images/Help_News.webp',
        imageMobile: '/assets/images/Help_News_M.webp',
        content: 'Stay updated with the latest additions to nAPPo Trails.'
    },
    {
        id: 'market',
        title: 'Market',
        imagePc: '/assets/images/Help_Market.webp',
        imageMobile: '/assets/images/Help_Market_M.webp',
        content: 'You can find offers and deals related to the Napoleonic Wars. You can also post your own if you have something to offer to the community. Just send us an email to nAPPoTrail@proton.me with your offer.'
    },
    {
        id: 'events',
        title: 'Events',
        imagePc: '/assets/images/Help_Event.webp',
        imageMobile: '/assets/images/Help_Event_M.webp',
        content: 'Here you can find information about upcoming events and historical gatherings related to the Napoleonic Wars such as reenactments, conferences, exhibitions, book presentations. Do you want to publish yours? Send us an email to nAPPoTrails@proton.me and we inform you.'
    },
    {
        id: 'calendar',
        title: 'Today in history',
        imagePc: '/assets/images/Help_Today.webp',
        imageMobile: '/assets/images/Help_Today_M.webp',
        content: 'Click this tag and you will find events and battles that happened on the current date during the Napoleonic Wars. Switch to "calendar" to view all events in any date. The small number next to the tag indicates the count of events for that date.'
    },
    {
        id: 'listmode',
        title: 'List Mode',
        imagePc: '/assets/images/Help_List.webp',
        imageMobile: '/assets/images/Help_List_M.webp',
        content: 'Switch to a card-based searchable list of all sites or for the ones you filtered. To go back to "map mode", press the "Map" tag wich replaced the "list mode" tag.'
    },
    {
        id: 'visitedsites',
        title: 'Visited Sites',
        imagePc: '/assets/images/Help_Visit.webp',
        imageMobile: '/assets/images/Help_Visit_M.webp',
        content: 'You can keep track of the sites you have visited. When you flag a site as "visited" the tag will turn green. In the filters drawer you can select which ones to show. To enable this feature you will be asked to sign in. "Visited" sites record is private and stored in your device and not share with anyone. There is a backup feature in the settings menu to transfer the data to a new device.'
    },
    {
        id: 'backup',
        title: 'Backup & Sync Data',
        imagePc: '/assets/images/Help_Backup.webp',
        imageMobile: '/assets/images/Help_Backup_M.webp',
        content: 'You can export your visited sites into a backup JSON file from the Settings menu (⚙️) and import it on another device to restore all your visited sites seamlessly without needing to manually re-enter data.'
    }
]
