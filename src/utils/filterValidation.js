import { getAvailableSiteMaps } from '../context/AppContext';

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const l1 = Number(lat1);
    const ln1 = Number(lon1);
    const l2 = Number(lat2);
    const ln2 = Number(lon2);
    if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) return undefined;

    const R = 6371; // Earth radius in km
    const dLat = (l2 - l1) * Math.PI / 180;
    const dLon = (ln2 - ln1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(l1 * Math.PI / 180) * Math.cos(l2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const getBelligerentStatus = (site, belligerent) => {
    if (!site || !belligerent || belligerent === 'all') return null;
    const target = String(belligerent).trim().toLowerCase();

    const getList = (val) => {
        if (!val) return [];
        return (Array.isArray(val) ? val : [val]).map(v => String(v).trim().toLowerCase());
    };

    const vList = getList(site.victor);
    const dList = getList(site.defeated);
    const tList = getList(site.tie);

    // 1. Explicit tie field
    if (tList.includes(target)) {
        return 'tie';
    }

    // 2. Explicit victor field (not inconclusive placeholder)
    if (vList.includes(target) && !vList.includes('inconclusive') && !vList.includes('tie') && !vList.includes('draw')) {
        return 'victor';
    }

    // 3. Explicit defeated field
    if (dList.includes(target)) {
        return 'loss';
    }

    // 4. Inconclusive battle fallback (for sites without explicit site.tie populated yet)
    const isTieSite = vList.includes('inconclusive') || vList.includes('tie') || vList.includes('draw') ||
        ((site.commander_Tie || []).length > 0 && vList.length === 0 && dList.length === 0);

    if (isTieSite) {
        const fullText = (
            (site.name || '') + ' ' +
            (site.description || '') + ' ' +
            (site.country || '') + ' ' +
            (site.commander_Tie || []).join(' ')
        ).toLowerCase();

        const frenchCmds = ['napoleon', 'ney', 'soult', 'mortier', 'oudinot', 'marmont', 'girard', 'trelliard', 'beauharnais', 'jerome'];
        const russianCmds = ['bennigsen', 'chichagov', 'wittgenstein', 'kutuzov', 'dokhturov', 'miloradovich', 'auvray'];
        const austrianCmds = ['archduke charles', 'bellegarde', 'schmitt'];
        const britishCmds = ['wellington', 'beresford', 'bock', 'd\'urban', 'orange', 'wellesley'];
        const spanishCmds = ['blake'];
        const prussianCmds = ['estocq', 'blucher'];

        let involved = false;
        if (target === 'france' || target === 'french') {
            involved = true;
        } else if (target === 'russia') {
            involved = russianCmds.some(c => fullText.includes(c)) || fullText.includes('russia');
        } else if (target === 'austria' || target === ' austria') {
            involved = austrianCmds.some(c => fullText.includes(c)) || fullText.includes('austria');
        } else if (target === 'britain' || target === 'great britain' || target === 'uk') {
            involved = britishCmds.some(c => fullText.includes(c)) || fullText.includes('britain') || fullText.includes('british') || fullText.includes('uk');
        } else if (target === 'spain') {
            involved = spanishCmds.some(c => fullText.includes(c)) || fullText.includes('spain') || fullText.includes('spanish');
        } else if (target === 'prussia' || target === 'prusia') {
            involved = prussianCmds.some(c => fullText.includes(c)) || fullText.includes('prussia');
        } else {
            involved = fullText.includes(target);
        }

        if (involved) return 'tie';
    }

    return null;
};

export const isSiteCategorySelected = (targetSite, filterCategory) => {
    if (!filterCategory || !Array.isArray(filterCategory) || filterCategory.length === 0) return true;
    const hasTodaysBattle = filterCategory.includes("Today's Battle");
    const otherCategories = filterCategory.filter(c => c !== "Today's Battle");

    if (otherCategories.includes(targetSite.category)) return true;

    if (hasTodaysBattle && (targetSite.category === 'Battle site' || targetSite.category === 'Naval battle') && targetSite.date) {
        const today = new Date();
        const parts = targetSite.date.split('-');
        if (parts.length >= 3) {
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            if (month === today.getMonth() + 1 && day === today.getDate()) return true;
        }
    }

    return false;
};

export const validateSiteFilters = (targetSite, context) => {
    if (!targetSite) return { passed: true };

    const {
        locationMode,
        userCoords,
        filterRadius,
        setFilterRadius,
        filterCategory,
        setFilterCategory,
        filterYear,
        setFilterYear,
        filterMonth,
        setFilterMonth,
        filterCommander,
        setFilterCommander,
        filterCommanderRole,
        setFilterCommanderRole,
        filterBelligerent,
        setFilterBelligerent,
        filterCountry,
        setFilterCountry,
        filterCoalition,
        setFilterCoalition,
        filterCampaign,
        setFilterCampaign,
        showArcOnly,
        setShowArcOnly,
        filterSignificance,
        setFilterSignificance,
        filterVisited,
        setFilterVisited,
        filterWithMaps,
        setFilterWithMaps,
        showOnlyNew,
        setShowOnlyNew,
        filterSearch,
        setFilterSearch
    } = context;

    const locationLabel = locationMode === 'geo'
        ? 'My GPS Location'
        : locationMode === 'manual'
            ? 'Manual Location'
            : (locationMode || 'selected location');

    const failedFilters = [];

    // 1. Category Filter
    const catPass = isSiteCategorySelected(targetSite, filterCategory);
    if (!catPass) {
        failedFilters.push({
            type: 'category',
            label: 'Category',
            message: `category "${targetSite.category}" is not selected`,
            reset: () => setFilterCategory && setFilterCategory([])
        });
    }

    // 2. Area / Radius Filter
    let dist = undefined;
    if (userCoords && filterRadius && filterRadius !== 'all' && targetSite.latitude !== undefined && targetSite.longitude !== undefined) {
        dist = calculateDistance(userCoords.lat, userCoords.lon, targetSite.latitude, targetSite.longitude);
        const radiusLimit = parseInt(filterRadius, 10);
        if (dist !== undefined && dist > radiusLimit) {
            failedFilters.push({
                type: 'area',
                label: 'Area',
                message: `${filterRadius} km from ${locationLabel}`,
                distance: Math.round(dist),
                reset: () => setFilterRadius && setFilterRadius('all')
            });
        }
    }

    // 3. Year Filter
    if (filterYear && filterYear !== 'all') {
        const siteYearStr = targetSite.year ? String(targetSite.year).trim() : '';
        if (siteYearStr !== filterYear) {
            failedFilters.push({
                type: 'year',
                label: 'Year',
                message: `year "${targetSite.year || 'N/A'}" is not selected`,
                reset: () => setFilterYear && setFilterYear('all')
            });
        }
    }

    // Month Filter
    if (filterMonth && filterMonth !== 'all') {
        let siteMonthStr = '';
        if (targetSite.date) {
            const match = String(targetSite.date).trim().match(/^\d{4}-(\d{1,2})/);
            if (match) siteMonthStr = String(parseInt(match[1], 10));
        }
        if (siteMonthStr !== String(parseInt(filterMonth, 10))) {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const monthLabel = monthNames[parseInt(filterMonth, 10)] || filterMonth;
            failedFilters.push({
                type: 'month',
                label: 'Month',
                message: `month filter "${monthLabel}" is active`,
                reset: () => setFilterMonth && setFilterMonth('all')
            });
        }
    }

    // 4. Commander Filter
    if (filterCommander && filterCommander !== 'all') {
        const cmds = Array.isArray(targetSite.commanders) ? targetSite.commanders : [targetSite.commander].filter(Boolean);
        const targetCmd = String(filterCommander).trim().toLowerCase();
        const cmdMatch = cmds.some(c => String(c).trim().toLowerCase() === targetCmd);
        if (!cmdMatch) {
            failedFilters.push({
                type: 'commander',
                label: 'Commander',
                message: `commander "${filterCommander}" is not selected`,
                reset: () => {
                    if (setFilterCommander) setFilterCommander('all');
                    if (setFilterCommanderRole) setFilterCommanderRole('all');
                }
            });
        } else if (filterCommanderRole && filterCommanderRole !== 'all') {
            const normalizeList = (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val.map(v => String(v).trim().toLowerCase());
                return [String(val).trim().toLowerCase()];
            };
            const victors = normalizeList(targetSite.commander_Victor || targetSite.commanders_victor || targetSite.commander_victor || targetSite.commander_win);
            const losses = normalizeList(targetSite.commander_Loss || targetSite.commanders_defeated || targetSite.commander_loss || targetSite.commander_defeated);
            const ties = normalizeList(targetSite.commander_Tie || targetSite.commander_tie || targetSite.commander_Inconclusive || targetSite.commander_inconclusive || targetSite.commander_draw);

            let roleMatched = true;
            if (filterCommanderRole === 'victor') {
                roleMatched = victors.includes(targetCmd);
            } else if (filterCommanderRole === 'loss' || filterCommanderRole === 'defeated') {
                roleMatched = losses.includes(targetCmd);
            } else if (filterCommanderRole === 'tie' || filterCommanderRole === 'inconclusive') {
                roleMatched = ties.includes(targetCmd);
            }

            if (!roleMatched) {
                const roleLabels = { victor: 'Victories', loss: 'Defeats', defeated: 'Defeats', tie: 'Inconclusive', inconclusive: 'Inconclusive' };
                failedFilters.push({
                    type: 'commanderRole',
                    label: 'Commander Battle Outcome',
                    message: `commander "${filterCommander}" outcome does not match "${roleLabels[filterCommanderRole] || filterCommanderRole}"`,
                    reset: () => setFilterCommanderRole && setFilterCommanderRole('all')
                });
            }
        }
    }

    // Belligerents Filter
    if (filterBelligerent && filterBelligerent !== 'all') {
        const status = getBelligerentStatus(targetSite, filterBelligerent);
        if (!status) {
            failedFilters.push({
                type: 'belligerent',
                label: 'Belligerents',
                message: `belligerent "${filterBelligerent}" is not involved in this battle`,
                reset: () => {
                    if (setFilterBelligerent) setFilterBelligerent('all');
                    if (setFilterCommanderRole && (!filterCommander || filterCommander === 'all')) setFilterCommanderRole('all');
                }
            });
        } else if (filterCommanderRole && filterCommanderRole !== 'all' && (!filterCommander || filterCommander === 'all')) {
            let roleMatched = true;
            if (filterCommanderRole === 'victor') {
                roleMatched = status === 'victor';
            } else if (filterCommanderRole === 'loss' || filterCommanderRole === 'defeated') {
                roleMatched = status === 'loss';
            } else if (filterCommanderRole === 'tie' || filterCommanderRole === 'inconclusive') {
                roleMatched = status === 'tie';
            }

            if (!roleMatched) {
                const roleLabels = { victor: 'Victories', loss: 'Defeats', defeated: 'Defeats', tie: 'Inconclusive', inconclusive: 'Inconclusive' };
                failedFilters.push({
                    type: 'commanderRole',
                    label: 'Battle Outcome',
                    message: `belligerent "${filterBelligerent}" outcome does not match "${roleLabels[filterCommanderRole] || filterCommanderRole}"`,
                    reset: () => setFilterCommanderRole && setFilterCommanderRole('all')
                });
            }
        }
    }

    // 5. Country Filter
    if (filterCountry && filterCountry !== 'all') {
        if (targetSite.country !== filterCountry) {
            failedFilters.push({
                type: 'country',
                label: 'Country',
                message: `country "${targetSite.country || 'N/A'}" is not selected`,
                reset: () => setFilterCountry && setFilterCountry('all')
            });
        }
    }

    // 6. Coalition Filter
    if (filterCoalition && filterCoalition !== 'all') {
        const specList = targetSite.special ? (Array.isArray(targetSite.special) ? targetSite.special : [String(targetSite.special)]) : [];
        if (!specList.includes(String(filterCoalition))) {
            failedFilters.push({
                type: 'coalition',
                label: 'Coalition',
                message: `coalition filter "${filterCoalition}" is active`,
                reset: () => setFilterCoalition && setFilterCoalition('all')
            });
        }
    }

    // 7. Campaign Filter
    if (filterCampaign && filterCampaign !== 'all') {
        const specList = targetSite.special ? (Array.isArray(targetSite.special) ? targetSite.special : [String(targetSite.special)]) : [];
        if (!specList.includes(filterCampaign)) {
            failedFilters.push({
                type: 'campaign',
                label: 'Campaign',
                message: `campaign filter "${filterCampaign}" is active`,
                reset: () => setFilterCampaign && setFilterCampaign('all')
            });
        }
    }

    // 8. Arc de Triomphe Filter
    if (showArcOnly) {
        const specList = targetSite.special ? (Array.isArray(targetSite.special) ? targetSite.special : [String(targetSite.special)]) : [];
        if (!specList.includes('arc')) {
            failedFilters.push({
                type: 'arc',
                label: 'Arc de Triomphe',
                message: `site is not listed at the Arc de Triomphe`,
                reset: () => setShowArcOnly && setShowArcOnly(false)
            });
        }
    }

    // 9. Significance Filter
    if (filterSignificance && filterSignificance !== '') {
        if (String(targetSite.significance) !== String(filterSignificance)) {
            failedFilters.push({
                type: 'significance',
                label: 'Significance',
                message: `significance rating does not match filter (${filterSignificance} star${filterSignificance > 1 ? 's' : ''})`,
                reset: () => setFilterSignificance && setFilterSignificance('')
            });
        }
    }

    // 10. Visited Filter
    if (filterVisited && filterVisited !== 'all') {
        if ((filterVisited === 'visited' && !targetSite.visited) || (filterVisited === 'unvisited' && targetSite.visited)) {
            failedFilters.push({
                type: 'visited',
                label: 'Visited Status',
                message: `site is ${targetSite.visited ? 'visited' : 'unvisited'}, but filter is set to "${filterVisited}"`,
                reset: () => setFilterVisited && setFilterVisited('all')
            });
        }
    }

    // 11. With Maps Filter
    if (filterWithMaps) {
        if (getAvailableSiteMaps(targetSite).length === 0) {
            failedFilters.push({
                type: 'withMaps',
                label: 'With Maps',
                message: `site has no historical maps available`,
                reset: () => setFilterWithMaps && setFilterWithMaps(false)
            });
        }
    }

    // 12. Only New Filter
    if (showOnlyNew) {
        if (!targetSite.isNew) {
            failedFilters.push({
                type: 'onlyNew',
                label: 'Only New',
                message: `site is not marked as new`,
                reset: () => setShowOnlyNew && setShowOnlyNew(false)
            });
        }
    }

    // 13. Search Filter
    if (filterSearch && filterSearch.trim() !== '') {
        if (!targetSite.name || !targetSite.name.toLowerCase().includes(filterSearch.toLowerCase().trim())) {
            failedFilters.push({
                type: 'search',
                label: 'Search',
                message: `site name does not match search query "${filterSearch}"`,
                reset: () => setFilterSearch && setFilterSearch('')
            });
        }
    }

    if (failedFilters.length > 0) {
        let title = '';
        let message = '';
        let resetButtonText = '';
        const areaDist = failedFilters.find(f => f.type === 'area')?.distance;

        if (failedFilters.length === 1) {
            const single = failedFilters[0];
            if (single.type === 'category') {
                title = 'Site Category Not Selected';
                message = `Site is out of the selected category, category "${targetSite.category}" is not selected`;
                resetButtonText = 'Reset Category & View';
            } else if (single.type === 'area') {
                title = 'Site Out of Selected Area';
                message = `Site is out of the selected area, ${filterRadius} km from ${locationLabel}`;
                resetButtonText = 'Reset Area & View';
            } else if (single.type === 'year') {
                title = 'Site Out of Selected Year';
                message = `Site is out of the selected year, year "${targetSite.year || 'N/A'}" is not selected`;
                resetButtonText = 'Reset Year & View';
            } else if (single.type === 'month') {
                title = 'Site Out of Selected Month';
                message = `Site is out of the selected month, ${single.message}`;
                resetButtonText = 'Reset Month & View';
            } else if (single.type === 'commander') {
                title = 'Site Out of Selected Commander';
                message = `Site is out of the selected commander, commander "${filterCommander}" is not selected`;
                resetButtonText = 'Reset Commander & View';
            } else if (single.type === 'belligerent') {
                title = 'Site Out of Selected Belligerent';
                message = `Site is out of the selected belligerent, "${filterBelligerent}" was not involved in this battle`;
                resetButtonText = 'Reset Belligerent & View';
            } else if (single.type === 'country') {
                title = 'Site Out of Selected Country';
                message = `Site is out of the selected country, country "${targetSite.country || 'N/A'}" is not selected`;
                resetButtonText = 'Reset Country & View';
            } else if (single.type === 'coalition') {
                title = 'Site Out of Selected Coalition';
                message = `Site is out of the selected coalition ("${filterCoalition}")`;
                resetButtonText = 'Reset Coalition & View';
            } else if (single.type === 'campaign') {
                title = 'Site Out of Selected Campaign';
                message = `Site is out of the selected campaign ("${filterCampaign}")`;
                resetButtonText = 'Reset Campaign & View';
            } else if (single.type === 'arc') {
                title = 'Site Not at Arc de Triomphe';
                message = `Site is not listed at the Arc de Triomphe`;
                resetButtonText = 'Reset Arc Filter & View';
            } else if (single.type === 'significance') {
                title = 'Site Out of Selected Significance';
                message = `Site significance rating does not match selected filter (${filterSignificance} star${filterSignificance > 1 ? 's' : ''})`;
                resetButtonText = 'Reset Significance & View';
            } else if (single.type === 'visited') {
                title = 'Site Out of Selected Visited Status';
                message = `Site is ${targetSite.visited ? 'visited' : 'unvisited'}, but filter is set to "${filterVisited}"`;
                resetButtonText = 'Reset Visited & View';
            } else if (single.type === 'withMaps') {
                title = 'Site Has No Maps';
                message = `Site has no historical maps available, but "With Maps" filter is active`;
                resetButtonText = 'Reset Maps Filter & View';
            } else if (single.type === 'onlyNew') {
                title = 'Site Is Not New';
                message = `Site is not marked as new, but "Only New" filter is active`;
                resetButtonText = 'Reset New Filter & View';
            } else if (single.type === 'search') {
                title = 'Site Filtered Out by Search';
                message = `Site name does not match search query "${filterSearch}"`;
                resetButtonText = 'Reset Search & View';
            } else {
                title = `Site Out of Selected ${single.label}`;
                message = `Site is hidden by ${single.label} filter: ${single.message}`;
                resetButtonText = `Reset ${single.label} & View`;
            }
        } else if (failedFilters.length === 2 && failedFilters.some(f => f.type === 'category') && failedFilters.some(f => f.type === 'area')) {
            title = 'Site Out of Category & Selected Area';
            message = `Site is out of the selected category, category "${targetSite.category}" is not selected and site is ${Math.round(dist)} km from ${locationLabel}`;
            resetButtonText = 'Reset Filters & View';
        } else {
            title = 'Site Out of Selected Filters';
            const messagesList = failedFilters.map(f => f.message).join(', ');
            message = `Site is hidden by active filters: ${messagesList}`;
            resetButtonText = 'Reset Filters & View';
        }

        return {
            passed: false,
            errorData: {
                type: 'custom',
                failedFilters: failedFilters,
                title: title,
                message: message,
                targetSite: targetSite,
                resetButtonText: resetButtonText,
                distance: areaDist
            }
        };
    }

    return { passed: true };
};

