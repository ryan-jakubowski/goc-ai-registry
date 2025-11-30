import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Globe, Info, ExternalLink, ChevronDown, ChevronUp, ChevronRight, Eye, Maximize2, Minimize2 } from 'lucide-react';
import { semanticSearch, loadModel } from './lib/search';

// Components
const Header = ({ lang, setLang }) => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-copper-roof rounded-md flex items-center justify-center text-white font-bold">
                    AI
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                    {lang === 'en' ? 'GC AI Registry' : 'Registre de l\'IA du GC'}
                </h1>
            </div>
            <button
                onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors cursor-pointer"
            >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'Français' : 'English'}
            </button>
        </div>
    </header>
);

const Explainer = ({ lang }) => (
    <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {lang === 'en' ? 'Exploring Artificial Intelligence in the Government of Canada' : 'Explorer l\'intelligence artificielle au sein du gouvernement du Canada'}
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                    {lang === 'en'
                        ? 'This unofficial tool helps you explore the Government of Canada\'s AI inventory. Use the semantic search to find projects by concept (e.g., "detecting fraud" or "chatbots") even if the exact keywords aren\'t used.'
                        : 'Cet outil non officiel vous aide à explorer l\'inventaire de l\'IA du gouvernement du Canada. Utilisez la recherche sémantique pour trouver des projets par concept (par exemple, « détection de la fraude » ou « agents conversationnels ») même si les mots-clés exacts ne sont pas utilisés.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-2 text-sm text-copper-roof-dark bg-copper-roof/10 p-3 rounded-md flex-1">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>
                            {lang === 'en'
                                ? 'This website is not affiliated with the Government of Canada. It is a visualization of the open dataset.'
                                : 'Ce site Web n\'est pas affilié au gouvernement du Canada. Il s\'agit d\'une visualisation de l\'ensemble de données ouvert.'}
                        </p>
                    </div>
                    <a
                        href="https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                        {lang === 'en' ? 'View Original Data' : 'Voir les données originales'}
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    </div>
);

const Badge = ({ children, className }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className} whitespace-nowrap`}>
        {children}
    </span>
);

const StatusBadge = ({ status, lang }) => {
    if (!status) {
        return (
            <Badge className="bg-gray-100 text-gray-500 border border-gray-200">
                {lang === 'en' ? 'Unknown' : 'Inconnu'}
            </Badge>
        );
    }

    const colors = {
        'In production': 'bg-green-100 text-green-800',
        'En production': 'bg-green-100 text-green-800',
        'In development': 'bg-blue-100 text-blue-800',
        'En cours de développement': 'bg-blue-100 text-blue-800',
        'Retired': 'bg-gray-100 text-gray-800',
        'Mis hors service': 'bg-gray-100 text-gray-800',
    };

    const defaultColor = 'bg-gray-100 text-gray-800';

    return (
        <Badge className={colors[status] || defaultColor}>
            {status}
        </Badge>
    );
};

const Row = ({ project, lang, expanded, onToggle }) => {
    return (
        <>
            <tr
                className="hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
                <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            className="mt-1 text-gray-400 hover:text-copper-roof transition-colors"
                            title={lang === 'en' ? 'View details' : 'Voir les détails'}
                        >
                            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div className="select-text">
                            <div className="text-sm font-medium text-copper-roof-dark">{project.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{project.id}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 select-text">
                    {project.department}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 select-text">
                    <div>{project.developed_by}</div>
                    {project.vendor && <div className="text-xs text-gray-400 mt-0.5">{project.vendor}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 select-text">
                    {project.users}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${project.pii === 'Y' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span className="select-text">{project.pii === 'Y' ? (lang === 'en' ? 'Yes' : 'Oui') : (lang === 'en' ? 'No' : 'Non')}</span>
                    </div>
                    {project.pii_banks && (
                        <div className="text-xs text-gray-400 select-text">{project.pii_banks}</div>
                    )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${project.notification_ai === 'Y' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="select-text">{project.notification_ai === 'Y' ? (lang === 'en' ? 'Yes' : 'Oui') : (lang === 'en' ? 'No' : 'Non')}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <StatusBadge status={project.status} lang={lang} />
                    {project.status_date && <div className="text-xs text-gray-500 mt-1 select-text">{project.status_date}</div>}
                </td>
                <td className="px-6 py-4 text-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="text-copper-roof hover:text-copper-roof-dark transition-colors flex items-center gap-1 mx-auto"
                        title={lang === 'en' ? 'View description, capabilities, and results' : 'Voir la description, les capacités et les résultats'}
                    >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">{lang === 'en' ? 'Details' : 'Détails'}</span>
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-gray-50">
                    <td colSpan="8" className="px-6 pb-6 pt-2">
                        <div className="ml-6 pl-4 border-l-2 border-copper-roof/30 grid grid-cols-1 gap-4 text-sm">

                            <div className="select-text">
                                <h4 className="font-semibold text-gray-900 mb-1">{lang === 'en' ? 'Description' : 'Description'}</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
                            </div>

                            <div className="select-text">
                                <h4 className="font-semibold text-gray-900 mb-1">{lang === 'en' ? 'Capabilities' : 'Capacités'}</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">{project.capabilities}</p>
                            </div>

                            <div className="select-text">
                                <h4 className="font-semibold text-gray-900 mb-1">{lang === 'en' ? 'Results' : 'Résultats'}</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">{project.results}</p>
                            </div>

                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

function App() {
    const [lang, setLang] = useState('en');
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        users: '',
        developed_by: '',
        pii: '',
        notification_ai: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Expand all state
    const [expandAll, setExpandAll] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Load data when language changes
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const response = await fetch(`./data_${lang}.json`);
                const jsonData = await response.json();
                setData(jsonData);
                setFilteredData(jsonData);
                // Reset state
                setSearchQuery('');
                setFilters({
                    department: '',
                    status: '',
                    users: '',
                    developed_by: '',
                    pii: '',
                    notification_ai: ''
                });
                setCurrentPage(1);
                setExpandedRows(new Set());
                setExpandAll(false);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [lang]);

    // Extract unique values for dropdowns
    const uniqueValues = useMemo(() => {
        const getUnique = (key) => [...new Set(data.map(d => d[key]).filter(Boolean))].sort();
        return {
            department: getUnique('department'),
            status: getUnique('status'),
            users: getUnique('users'),
            developed_by: getUnique('developed_by'),
        };
    }, [data]);

    // Handle search and filtering
    useEffect(() => {
        async function runSearch() {
            setIsSearching(true);
            let results = data;

            // Apply Filters
            if (filters.department) results = results.filter(item => item.department === filters.department);
            if (filters.status) {
                if (filters.status === 'BLANK') {
                    results = results.filter(item => !item.status);
                } else {
                    results = results.filter(item => item.status === filters.status);
                }
            }
            if (filters.users) results = results.filter(item => item.users === filters.users);
            if (filters.developed_by) results = results.filter(item => item.developed_by === filters.developed_by);
            if (filters.pii) results = results.filter(item => item.pii === filters.pii);
            if (filters.notification_ai) results = results.filter(item => item.notification_ai === filters.notification_ai);

            // Apply Semantic Search
            if (searchQuery.trim()) {
                results = await semanticSearch(searchQuery, results);
            }

            setFilteredData(results);
            setCurrentPage(1); // Reset to first page on filter change
            setIsSearching(false);
        }

        const timeoutId = setTimeout(() => {
            if (data.length > 0) runSearch();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, filters, data]);

    // Preload model on mount
    useEffect(() => {
        loadModel();
    }, []);

    const suggestedTags = lang === 'en'
        ? ['Chatbot', 'Fraud', 'Risk', 'Environment', 'Border', 'Health']
        : ['Clavardage', 'Fraude', 'Risque', 'Environnement', 'Frontière', 'Santé'];

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = itemsPerPage === 'All' ? filteredData : filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(filteredData.length / itemsPerPage);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleExpandAll = () => {
        if (expandAll) {
            setExpandedRows(new Set());
            setExpandAll(false);
        } else {
            const allIds = new Set(currentItems.map(p => p.id));
            setExpandedRows(allIds);
            setExpandAll(true);
        }
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
        // Update expandAll state based on whether all are expanded
        setExpandAll(newExpanded.size === currentItems.length && currentItems.length > 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header lang={lang} setLang={setLang} />
            <Explainer lang={lang} />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Search and Filter Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">

                    {/* Search Input */}
                    <div className="mb-6">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            {lang === 'en' ? 'Semantic Search' : 'Recherche sémantique'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-copper-roof focus:border-copper-roof sm:text-sm transition duration-150 ease-in-out"
                                placeholder={lang === 'en' ? 'Try "detecting anomalies" or "generative AI"...' : 'Essayez « détection d\'anomalies » ou « IA générative »...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isSearching && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <div className="animate-spin h-4 w-4 border-2 border-copper-roof border-t-transparent rounded-full"></div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {suggestedTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-copper-roof hover:text-white transition-colors cursor-pointer"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filters Grid - Order matches columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* Department */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Department' : 'Ministère'}</label>
                            <select
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-copper-roof focus:border-copper-roof sm:text-sm"
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                            >
                                <option value="">{lang === 'en' ? 'All Departments' : 'Tous les ministères'}</option>
                                {uniqueValues.department.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Developed By */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Developed By' : 'Développé par'}</label>
                            <select
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-copper-roof focus:border-copper-roof sm:text-sm"
                                value={filters.developed_by}
                                onChange={(e) => handleFilterChange('developed_by', e.target.value)}
                            >
                                <option value="">{lang === 'en' ? 'Any' : 'Tous'}</option>
                                {uniqueValues.developed_by.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        {/* Users */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Primary Users' : 'Utilisateurs principaux'}</label>
                            <select
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-copper-roof focus:border-copper-roof sm:text-sm"
                                value={filters.users}
                                onChange={(e) => handleFilterChange('users', e.target.value)}
                            >
                                <option value="">{lang === 'en' ? 'Any' : 'Tous'}</option>
                                {uniqueValues.users.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        {/* PII */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Personal Information' : 'Renseignements personnels'}</label>
                            <select
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-copper-roof focus:border-copper-roof sm:text-sm"
                                value={filters.pii}
                                onChange={(e) => handleFilterChange('pii', e.target.value)}
                            >
                                <option value="">{lang === 'en' ? 'Any' : 'Tous'}</option>
                                <option value="Y">{lang === 'en' ? 'Yes' : 'Oui'}</option>
                                <option value="N">{lang === 'en' ? 'No' : 'Non'}</option>
                            </select>
                        </div>

                        {/* Users Notified of AI */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Users Notified of AI' : 'Utilisateurs avisés de l\'IA'}</label>
                            <select
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-copper-roof focus:border-copper-roof sm:text-sm"
                                value={filters.notification_ai}
                                onChange={(e) => handleFilterChange('notification_ai', e.target.value)}
                            >
                                <option value="">{lang === 'en' ? 'Any' : 'Tous'}</option>
                                <option value="Y">{lang === 'en' ? 'Yes' : 'Oui'}</option>
                                <option value="N">{lang === 'en' ? 'No' : 'Non'}</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Status' : 'État'}</label>
                            <select
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-copper-roof focus:border-copper-roof sm:text-sm"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">{lang === 'en' ? 'Any' : 'Tous'}</option>
                                {uniqueValues.status.map(s => <option key={s} value={s}>{s}</option>)}
                                <option value="BLANK">{lang === 'en' ? 'Unknown / Blank' : 'Inconnu / Vide'}</option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Results Info & Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                            {loading
                                ? (lang === 'en' ? 'Loading data...' : 'Chargement des données...')
                                : `${filteredData.length} ${lang === 'en' ? 'projects found' : 'projets trouvés'}`
                            }
                        </div>
                        <button
                            onClick={toggleExpandAll}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {expandAll ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            <span>{expandAll ? (lang === 'en' ? 'Collapse All' : 'Réduire tout') : (lang === 'en' ? 'Expand All' : 'Développer tout')}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{lang === 'en' ? 'Show:' : 'Afficher:'}</span>
                        <select
                            className="py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-copper-roof focus:border-copper-roof text-sm"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value="All">{lang === 'en' ? 'All' : 'Tout'}</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {lang === 'en' ? 'Project Name' : 'Nom du projet'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {lang === 'en' ? 'Department' : 'Ministère'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {lang === 'en' ? 'Developed By' : 'Développé par'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {lang === 'en' ? 'Users' : 'Utilisateurs'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {lang === 'en' ? 'Personal Information' : 'Renseignements personnels'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {lang === 'en' ? 'Users Notified of AI' : 'Utilisateurs avisés de l\'IA'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {lang === 'en' ? 'Status' : 'État'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {lang === 'en' ? 'View' : 'Voir'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {currentItems.map((project) => (
                                    <Row
                                        key={project.id}
                                        project={project}
                                        lang={lang}
                                        expanded={expandedRows.has(project.id)}
                                        onToggle={() => toggleRow(project.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredData.length === 0 && !loading && (
                        <div className="px-6 py-12 text-center text-gray-500">
                            {lang === 'en' ? 'No projects found matching your criteria.' : 'Aucun projet trouvé correspondant à vos critères.'}
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {itemsPerPage !== 'All' && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                        <span className="text-sm text-gray-700">
                            {lang === 'en' ? `Page ${currentPage} of ${totalPages}` : `Page ${currentPage} de ${totalPages}`}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                    </div>
                )}

            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">
                        {new Date().toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                        {lang === 'en'
                            ? 'Contains information licensed under the Open Government Licence – Canada.'
                            : 'Contient des informations sous la Licence du gouvernement ouvert – Canada.'}
                    </p>
                    <p className="text-xs text-gray-400">
                        {lang === 'en'
                            ? 'Vibe-coded in Google Antigravity with Gemini and Claude'
                            : 'Codé dans Google Antigravity avec Gemini et Claude'}
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
