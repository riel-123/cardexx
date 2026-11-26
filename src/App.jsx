import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Archive,
  ShoppingBag,
  ArrowLeftRight,
  History,
  Plus,
  Search,
  X,
  Edit3,
  Trash2,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  Download,
  FileSpreadsheet,
  Share2,
  Sparkles,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  TrendingUp,
  DollarSign,
  Layers,
  FolderArchive,
  Tags,
  TrendingDown,
  Flame,
  ArrowRight,
  BarChart3,
  ShieldAlert,
  Radar,
  Calendar
} from 'lucide-react';

// --- CUSTOM RAYQUAZA VECTOR LOGO ---
const RayquazaLogo = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="rayBody" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="55%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
      <linearGradient id="rayGold" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path
      d="M46 14C38 8 24 10 18 19C13 26 17 34 26 36C34 38 41 33 44 27C46 23 43 19 38 19C33 19 30 23 32 27"
      stroke="url(#rayBody)"
      strokeWidth="6.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 44C22 52 36 55 46 47C52 42 52 33 45 29"
      stroke="url(#rayBody)"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <path
      d="M47 13L56 9L52 17L58 20L49 22"
      fill="url(#rayGold)"
    />
    <circle cx="43.5" cy="17.5" r="2.2" fill="#facc15" />
    <circle cx="43.8" cy="17.5" r="1" fill="#090d16" />
    <path
      d="M23 16L27 19M19 25L23 27M32 49L35 45M43 45L40 41"
      stroke="url(#rayGold)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

// --- CONSTANTS & HELPERS ---
const POKEMON_LANGUAGES = [
  { code: 'JP', label: 'Japanese' },
  { code: 'EN', label: 'English' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'KR', label: 'Korean' },
  { code: 'CN', label: 'Chinese' },
  { code: 'TH', label: 'Thai' },
  { code: 'FR', label: 'French' },
  { code: 'DE', label: 'German' },
  { code: 'IT', label: 'Italian' },
  { code: 'ES', label: 'Spanish' },
  { code: 'PT', label: 'Portuguese' },
  { code: 'NL', label: 'Dutch' },
  { code: 'PL', label: 'Polish' },
  { code: 'RU', label: 'Russian' }
];

const GRADING_COMPANIES = ['Raw', 'PSA', 'BGS', 'CGC', 'SGC', 'ARS', 'TAG'];

const TCG_GAMES = [
  { id: 'POKEMON', label: 'Pokémon', badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  { id: 'ONE_PIECE', label: 'One Piece', badgeClass: 'bg-rose-500/15 text-rose-700 border-rose-500/30' }
];

const getTcgMeta = (tcgId) =>
  TCG_GAMES.find((t) => t.id === tcgId) || TCG_GAMES[0];

const getLanguageLabel = (code) => {
  const found = POKEMON_LANGUAGES.find((l) => l.code === code);
  return found ? found.label : code;
};

const formatIDR = (num) => {
  const val = Number(num) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val);
};

const formatMonthLabel = (ym) => {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return ym || '-';
  const [yearStr, monthStr] = ym.split('-');
  const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
};

const escapeHtmlCell = (val) =>
  String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const downloadExcelHtmlSheet = ({ filename, sheetTitle, headers, rows, totalsRow }) => {
  const headerCells = headers
    .map(
      (h) =>
        `<th style="background:#064e3b;color:#ffffff;border:1px solid #1e293b;padding:8px;font-weight:bold;text-align:left;">${escapeHtmlCell(
          h
        )}</th>`
    )
    .join('');

  const bodyRows = rows
    .map((row) => {
      const cells = row
        .map((cell, idx) => {
          const isNumeric = typeof cell === 'number';
          const align = isNumeric ? 'right' : 'left';
          const formattedVal = isNumeric ? cell.toLocaleString('id-ID') : escapeHtmlCell(cell);
          return `<td style="border:1px solid #cbd5e1;padding:6px 8px;text-align:${align};${
            idx === 0 ? 'font-weight:bold;' : ''
          }">${formattedVal}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const totalCells = totalsRow
    ? `<tr>${totalsRow
        .map((cell, idx) => {
          const isNumeric = typeof cell === 'number';
          const align = isNumeric ? 'right' : 'left';
          const formattedVal = isNumeric ? cell.toLocaleString('id-ID') : escapeHtmlCell(cell);
          return `<td style="background:#fef3c7;color:#0f172a;border:1px solid #94a3b8;padding:7px 8px;font-weight:bold;text-align:${align};${
            idx === 0 ? '' : ''
          }">${formattedVal}</td>`;
        })
        .join('')}</tr>`
    : '';

  const htmlWorkbook = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8" />
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${escapeHtmlCell(sheetTitle.slice(0, 31))}</x:Name>
          <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
</head>
<body>
  <table>
    <thead>
      <tr>
        <th colspan="${headers.length}" style="font-size:14px;font-weight:bold;text-align:left;padding:6px 4px;color:#064e3b;">
          ${escapeHtmlCell(sheetTitle)}
        </th>
      </tr>
      <tr>${headerCells}</tr>
    </thead>
    <tbody>
      ${bodyRows}
      ${totalCells}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob(['\ufeff', htmlWorkbook], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatDotInput = (val) => {
  const digits = String(val ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseDotNumber = (val) => {
  const digits = String(val ?? '').replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

const getGradingCompany = (gradeStr) => {
  const g = String(gradeStr || '').toUpperCase();
  if (g.includes('PSA')) return 'PSA';
  if (g.includes('BGS') || g.includes('BECKETT')) return 'BGS';
  if (g.includes('CGC')) return 'CGC';
  if (g.includes('SGC')) return 'SGC';
  if (g.includes('ARS')) return 'ARS';
  if (g.includes('TAG')) return 'TAG';
  return 'Raw';
};

// --- INITIAL DUMMY DATA (POKÉMON & ONE PIECE) ---
const INITIAL_CARDS = [
  {
    id: 'CRD-101',
    tcg: 'POKEMON',
    name: 'Charizard ex SAR',
    setName: 'Shiny Treasure ex (sv4a)',
    number: '349/190',
    language: 'JP',
    category: 'Graded Slab',
    gradingCompany: 'PSA',
    grade: 'PSA 10',
    storageLocation: 'Brankas Slab Utama',
    buyPrice: 2850000,
    targetPrice: 3650000,
    soldPrice: null,
    status: 'IN_STOCK',
    imageUrl: 'https://images.pokemontcg.io/sv4pt5/234_hires.png'
  },
  {
    id: 'CRD-102',
    tcg: 'POKEMON',
    name: 'Umbreon VMAX Alt Art (Moonbreon)',
    setName: 'Evolving Skies',
    number: '215/203',
    language: 'EN',
    category: 'Single Card',
    gradingCompany: 'Raw',
    grade: 'Raw NM/M',
    storageLocation: 'Binder 1 - High End',
    buyPrice: 12500000,
    targetPrice: 15200000,
    soldPrice: null,
    status: 'IN_STOCK',
    imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png'
  },
  {
    id: 'CRD-103',
    tcg: 'ONE_PIECE',
    name: 'Monkey D. Luffy Manga Rare',
    setName: 'Awakening of the New Era (OP-05)',
    number: 'OP05-119',
    language: 'JP',
    category: 'Graded Slab',
    gradingCompany: 'PSA',
    grade: 'PSA 10',
    storageLocation: 'Brankas Slab Utama',
    buyPrice: 24500000,
    targetPrice: 29500000,
    soldPrice: null,
    status: 'IN_STOCK',
    imageUrl: ''
  },
  {
    id: 'CRD-104',
    tcg: 'POKEMON',
    name: 'Pikachu ex SAR',
    setName: 'Super Electric Breaker (sv8)',
    number: '132/106',
    language: 'JP',
    category: 'Single Card',
    gradingCompany: 'Raw',
    grade: 'Raw NM/M',
    storageLocation: 'Binder 1 - High End',
    buyPrice: 3900000,
    targetPrice: 4850000,
    soldPrice: null,
    status: 'IN_STOCK',
    imageUrl: 'https://images.pokemontcg.io/sv8/238_hires.png'
  },
  {
    id: 'CRD-105',
    tcg: 'ONE_PIECE',
    name: 'Nami SP Alt Art',
    setName: 'Two Legends (OP-08)',
    number: 'OP08-106',
    language: 'JP',
    category: 'Single Card',
    gradingCompany: 'Raw',
    grade: 'Raw NM/M',
    storageLocation: 'Binder 1 - High End',
    buyPrice: 1450000,
    targetPrice: 1950000,
    soldPrice: null,
    status: 'IN_STOCK',
    imageUrl: ''
  },
  {
    id: 'CRD-100',
    tcg: 'POKEMON',
    name: 'Lugia V Alt Art',
    setName: 'Silver Tempest',
    number: '186/195',
    language: 'EN',
    category: 'Single Card',
    gradingCompany: 'Raw',
    grade: 'Raw NM/M',
    storageLocation: 'Binder 1 - High End',
    buyPrice: 2400000,
    targetPrice: 3100000,
    soldPrice: 3150000,
    status: 'SOLD',
    imageUrl: 'https://images.pokemontcg.io/swsh12/186_hires.png'
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'TRX-8901',
    type: 'SALE',
    tcg: 'POKEMON',
    date: '2026-11-24',
    summary: 'Lugia V Alt Art (EN • Raw NM/M)',
    revenue: 3150000,
    costBasis: 2400000,
    netProfit: 750000,
    notes: 'COD Bandung'
  }
];

export default function App() {
  // Navigation & Core State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [binderFilter, setBinderFilter] = useState('ALL');
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Master Data: Categories & Storage Locations
  const [categories, setCategories] = useState([]);
  const [storageLocations, setStorageLocations] = useState([]);

  // Inventory Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTcg, setFilterTcg] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterLanguage, setFilterLanguage] = useState('ALL');
  const [filterGrading, setFilterGrading] = useState('ALL');
  const [filterStorage, setFilterStorage] = useState('ALL');
  const [mobileBinder, setMobileBinder] = useState(null);

  // Sold Tab Search & TCG Filter
  const [soldSearchQuery, setSoldSearchQuery] = useState('');
  const [soldFilterTcg, setSoldFilterTcg] = useState('ALL');

  // POS State
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posSelectedCardId, setPosSelectedCardId] = useState('');
  const [posDealPrice, setPosDealPrice] = useState('');
  const [posNotes, setPosNotes] = useState('');

  // Trade-In State
  const [tradeCashFlowType, setTradeCashFlowType] = useState('STORE_RECEIVES');
  const [tradeCashAmount, setTradeCashAmount] = useState('');
  const [tradeOutSearch, setTradeOutSearch] = useState('');
  const [tradeOutCardIds, setTradeOutCardIds] = useState([]);
  const [tradeNotes, setTradeNotes] = useState('');
  const [tradeInItems, setTradeInItems] = useState([
    {
      tempId: 'TI-1',
      tcg: 'POKEMON',
      name: '',
      setName: '',
      number: '',
      language: 'JP',
      category: 'Single Card',
      gradingCompany: 'Raw',
      grade: 'Raw NM/M',
      storageLocation: 'Binder 1 - High End',
      valuationCost: '',
      targetSellPrice: '',
      imageUrl: ''
    }
  ]);

  // History Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
  const [historyTcgFilter, setHistoryTcgFilter] = useState('ALL');
  const [historyMonthFilter, setHistoryMonthFilter] = useState('ALL');
  const [exportMonth,setExportMonth]=useState('ALL');
  const [exportStorage,setExportStorage]=useState('ALL');

  const [selectedDetailCard, setSelectedDetailCard] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardForm, setCardForm] = useState({
    tcg: 'POKEMON',
    name: '',
    setName: '',
    number: '',
    language: 'JP',
    category: 'Single Card',
    gradingCompany: 'Raw',
    grade: 'Raw NM/M',
    storageLocation: 'Binder 1 - High End',
    buyPrice: '',
    targetPrice: '',
    imageUrl: ''
  });

  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [newStorageInput, setNewStorageInput] = useState('');
  const [showInlineStorageInput, setShowInlineStorageInput] = useState(false);
  const [inlineStorageName, setInlineStorageName] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showInlineCategoryInput, setShowInlineCategoryInput] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState('');

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  const [connection, setConnection] = useState('loading');
  const [connectionError, setConnectionError] = useState('');
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const photoBusy = useRef(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const uploadPhoto = async (image) => {
    if (!image?.startsWith('data:')) return image;
    const base = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
    const response = await fetch(base + '/cards/images', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({image})});
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Upload foto gagal (API ${response.status})`);
    }
    const result = await response.json();
    if (!result.url) throw new Error('URL foto tidak diterima');
    return result.url;
  };
  const api = async (path, method = 'GET', body) => {
    const base = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
    if (!base) throw new Error('VITE_API_URL belum dikonfigurasi');
    const response = await fetch(base + path, { method, ...(body === undefined ? {} : {headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)}), cache: 'no-store' });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API ${response.status}: ${path}`);
    }
    return response.json();
  };
  const loadData = async () => {
    setConnection('loading');
    try {
      const [loadedCards, loadedTransactions, master] = await Promise.all([api('/cards'), api('/transactions'), api('/master-data')]);
      if (!Array.isArray(loadedCards) || !Array.isArray(loadedTransactions)) throw new Error('Format respons API tidak valid');
      setCards(loadedCards); setTransactions(loadedTransactions);
      if (!Array.isArray(master.categories) || !Array.isArray(master.storageLocations)) throw new Error('Master data tidak valid');
      setCategories(master.categories);
      setStorageLocations(master.storageLocations);
      setTradeInItems(prev => prev.map(row => ({...row,
        category: master.categories.includes(row.category) ? row.category : master.categories[0] || '',
        storageLocation: master.storageLocations.includes(row.storageLocation) ? row.storageLocation : master.storageLocations[0] || ''
      })));
      setConnection('ready');
    } catch (error) { setConnectionError(error.message); setConnection('error'); }
  };
  useEffect(() => { loadData(); }, []);
  const persist = async (action) => {
    if (lock.current || connection !== 'ready') return false;
    lock.current = true; setSaving(true);
    try { await action(); return true; }
    catch (error) { showToast('Gagal menyimpan: ' + error.message, 'error'); return false; }
    finally { lock.current = false; setSaving(false); }
  };

  // --- ANALYTICS & DERIVED DATA ---
  const analytics = useMemo(() => {
    const inStock = cards.filter((c) => c.status === 'IN_STOCK');
    const sold = cards.filter((c) => c.status === 'SOLD');

    const totalModalStok = inStock.reduce((acc, c) => acc + (Number(c.buyPrice) || 0), 0);
    const totalEstimasiJual = inStock.reduce((acc, c) => acc + (Number(c.targetPrice) || 0), 0);
    const potensiProfitStok = totalEstimasiJual - totalModalStok;

    const totalOmzet = transactions.reduce((acc, t) => acc + (Number(t.revenue) || 0), 0);
    const totalCostSold = transactions.reduce((acc, t) => acc + (Number(t.costBasis) || 0), 0);
    const totalNetProfit = transactions.reduce((acc, t) => acc + (Number(t.netProfit) || 0), 0);
    const totalModalKeseluruhan = totalModalStok + totalCostSold;

    const pokemonCount = inStock.filter((c) => (c.tcg || 'POKEMON') === 'POKEMON').length;
    const onePieceCount = inStock.filter((c) => c.tcg === 'ONE_PIECE').length;

    const pokemonModal = inStock
      .filter((c) => (c.tcg || 'POKEMON') === 'POKEMON')
      .reduce((acc, c) => acc + (Number(c.buyPrice) || 0), 0);
    const onePieceModal = inStock
      .filter((c) => c.tcg === 'ONE_PIECE')
      .reduce((acc, c) => acc + (Number(c.buyPrice) || 0), 0);

    const categoryStats = categories.map((cat) => {
      const items = inStock.filter((c) => c.category === cat);
      return {
        name: cat,
        count: items.length,
        modal: items.reduce((sum, c) => sum + (Number(c.buyPrice) || 0), 0),
        target: items.reduce((sum, c) => sum + (Number(c.targetPrice) || 0), 0)
      };
    });

    return {
      inStockCount: inStock.length,
      soldCount: sold.length,
      pokemonCount,
      onePieceCount,
      pokemonModal,
      onePieceModal,
      totalModalStok,
      totalEstimasiJual,
      potensiProfitStok,
      totalOmzet,
      totalCostSold,
      totalNetProfit,
      totalModalKeseluruhan,
      categoryStats
    };
  }, [cards, transactions, categories]);

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (c.status !== 'IN_STOCK') return false;
      const cardTcg = c.tcg || 'POKEMON';
      if (filterTcg !== 'ALL' && cardTcg !== filterTcg) return false;
      if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;
      if (filterLanguage !== 'ALL' && c.language !== filterLanguage) return false;
      const co = c.gradingCompany || getGradingCompany(c.grade);
      if (filterGrading !== 'ALL' && co !== filterGrading) return false;
      if (filterStorage !== 'ALL' && c.storageLocation !== filterStorage) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${c.name} ${c.setName} ${c.number} ${c.grade} ${c.storageLocation} ${c.language} ${cardTcg}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cards, filterTcg, filterCategory, filterLanguage, filterGrading, filterStorage, searchQuery]);

  const soldCards = useMemo(() => {
    return cards.filter((c) => {
      if (c.status !== 'SOLD') return false;
      const cardTcg = c.tcg || 'POKEMON';
      if (soldFilterTcg !== 'ALL' && cardTcg !== soldFilterTcg) return false;
      if (!soldSearchQuery.trim()) return true;
      const q = soldSearchQuery.toLowerCase();
      return `${c.name} ${c.setName} ${c.number} ${c.grade} ${c.language} ${cardTcg}`.toLowerCase().includes(q);
    });
  }, [cards, soldSearchQuery, soldFilterTcg]);

  const availableInventory = useMemo(
    () => cards.filter((c) => c.status === 'IN_STOCK'),
    [cards]
  );

  const posFilteredInventory = useMemo(() => {
    if (!posSearchQuery.trim()) return availableInventory;
    const q = posSearchQuery.toLowerCase();
    return availableInventory.filter((c) =>
      `${c.name} ${c.setName} ${c.number} ${c.grade} ${c.language}`.toLowerCase().includes(q)
    );
  }, [availableInventory, posSearchQuery]);

  const selectedPosCard = useMemo(
    () => availableInventory.find((c) => c.id === posSelectedCardId) || null,
    [availableInventory, posSelectedCardId]
  );

  const posCalculation = useMemo(() => {
    const deal = parseDotNumber(posDealPrice);
    const cost = selectedPosCard ? Number(selectedPosCard.buyPrice) || 0 : 0;
    const profit = deal - cost;
    const marginPct = cost > 0 ? Math.round((profit / cost) * 100) : 0;
    return { deal, cost, profit, marginPct };
  }, [posDealPrice, selectedPosCard]);

  const filteredTradeOutInventory = useMemo(() => {
    if (!tradeOutSearch.trim()) return availableInventory;
    const q = tradeOutSearch.toLowerCase();
    return availableInventory.filter((c) =>
      `${c.name} ${c.setName} ${c.number} ${c.grade} ${c.language} ${c.storageLocation}`
        .toLowerCase()
        .includes(q)
    );
  }, [availableInventory, tradeOutSearch]);

  const tradeSummary = useMemo(() => {
    const outCards = availableInventory.filter((c) => tradeOutCardIds.includes(c.id));
    const totalOutCost = outCards.reduce((sum, c) => sum + (Number(c.buyPrice) || 0), 0);

    const validInItems = tradeInItems.filter((item) => item.name.trim());
    const totalInValuation = validInItems.reduce(
      (sum, item) => sum + parseDotNumber(item.valuationCost),
      0
    );

    const rawCash = tradeCashFlowType === 'EVEN' ? 0 : parseDotNumber(tradeCashAmount);
    const cashDelta =
      tradeCashFlowType === 'STORE_RECEIVES'
        ? rawCash
        : tradeCashFlowType === 'STORE_PAYS'
        ? -rawCash
        : 0;

    const tradeNetProfitImpact = totalInValuation + cashDelta - totalOutCost;
    return {
      outCards,
      validInItems,
      totalOutCost,
      totalInValuation,
      cashDelta,
      tradeNetProfitImpact
    };
  }, [availableInventory, tradeOutCardIds, tradeInItems, tradeCashFlowType, tradeCashAmount]);

  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    transactions.forEach((t) => {
      if (t.date && /^\d{4}-\d{2}/.test(t.date)) {
        monthSet.add(t.date.slice(0, 7));
      }
    });
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (historyTypeFilter !== 'ALL' && t.type !== historyTypeFilter) return false;
      const trxTcg = t.tcg || 'POKEMON';
      if (historyTcgFilter !== 'ALL' && trxTcg !== historyTcgFilter) return false;
      if (historyMonthFilter !== 'ALL') {
        const trxMonth = (t.date || '').slice(0, 7);
        if (trxMonth !== historyMonthFilter) return false;
      }
      if (!historySearch.trim()) return true;
      const q = historySearch.toLowerCase();
      return `${t.id} ${t.summary} ${t.date} ${t.notes || ''} ${trxTcg}`.toLowerCase().includes(q);
    });
  }, [transactions, historySearch, historyTypeFilter, historyTcgFilter, historyMonthFilter]);

  // --- CRUD CARD HANDLERS ---
  const handleOpenAddCard = () => {
    setEditingCard(null);
    setShowInlineCategoryInput(false);
    setShowInlineStorageInput(false);
    setCardForm({
      tcg: filterTcg !== 'ALL' ? filterTcg : 'POKEMON',
      name: '',
      setName: '',
      number: '',
      language: 'JP',
      category: categories[0] || 'Single Card',
      gradingCompany: 'Raw',
      grade: 'Raw NM/M',
      storageLocation: activeTab==='inventory' && filterStorage!=='ALL' && storageLocations.includes(filterStorage) ? filterStorage : storageLocations[0] || 'Binder 1 - High End',
      buyPrice: '',
      targetPrice: '',
      imageUrl: ''
    });
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (e, card) => {
    if (e) e.stopPropagation();
    setEditingCard(card);
    setShowInlineCategoryInput(false);
    setShowInlineStorageInput(false);
    setCardForm({
      tcg: card.tcg || 'POKEMON',
      name: card.name,
      setName: card.setName || '',
      number: card.number || '',
      language: card.language || 'JP',
      category: card.category || categories[0] || 'Single Card',
      gradingCompany: card.gradingCompany || getGradingCompany(card.grade),
      grade: card.grade || 'Raw NM/M',
      storageLocation: card.storageLocation || storageLocations[0] || 'Binder 1 - High End',
      buyPrice: formatDotInput(card.buyPrice),
      targetPrice: formatDotInput(card.targetPrice),
      imageUrl: card.imageUrl || ''
    });
    setIsCardModalOpen(true);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (photoBusy.current) { showToast('Foto masih diproses.', 'error'); return; }
    if (!cardForm.name.trim()) {
      showToast('Nama kartu wajib diisi.', 'error');
      return;
    }

    if ((!editingCard || editingCard.status === 'IN_STOCK') && (!categories.includes(cardForm.category) || !storageLocations.includes(cardForm.storageLocation))) { showToast('Pilih kategori dan lokasi penyimpanan aktif.', 'error'); return; }

    const payload = {
      tcg: cardForm.tcg || 'POKEMON',
      name: cardForm.name.trim(),
      setName: cardForm.setName.trim(),
      number: cardForm.number.trim() || '-',
      language: cardForm.language,
      category: cardForm.category,
      gradingCompany: cardForm.category === 'Graded Slab' ? (cardForm.gradingCompany === 'Raw' ? 'PSA' : cardForm.gradingCompany) : 'Raw',
      grade: cardForm.category === 'Graded Slab' ? (cardForm.gradingCompany === 'Raw' ? 'PSA 10' : cardForm.grade.trim() || `${cardForm.gradingCompany} 10`) : cardForm.category === 'Single Card' ? (cardForm.gradingCompany === 'Raw' ? cardForm.grade.trim() || 'Raw NM/M' : 'Raw NM/M') : 'Raw',
      storageLocation: cardForm.storageLocation,
      buyPrice: parseDotNumber(cardForm.buyPrice),
      targetPrice: parseDotNumber(cardForm.targetPrice),
      imageUrl: cardForm.imageUrl.trim()
    };

    const ok = await persist(async () => {
      if (editingCard && payload.imageUrl === (editingCard.imageUrl || '')) {
        delete payload.imageUrl; // Preserve existing photos, including legacy Base64.
      } else {
        payload.imageUrl = await uploadPhoto(payload.imageUrl);
        setCardForm(prev => ({...prev, imageUrl: payload.imageUrl}));
      }
      const saved = editingCard ? await api('/cards/' + encodeURIComponent(editingCard.id), 'PATCH', payload) : await api('/cards', 'POST', payload);
      setCards(prev => editingCard ? prev.map(c => c.id === editingCard.id ? saved : c) : [saved, ...prev]);
      showToast('Kartu berhasil disimpan ke database!');
    });
    if (!ok) return;
    setIsCardModalOpen(false);
  };

  const handleDeleteCard = async (e, cardId) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Hapus kartu ini dari database?')) return;
    await persist(async () => {
      await api('/cards/' + encodeURIComponent(cardId), 'DELETE');
      setCards(prev => prev.filter(c => c.id !== cardId));
      showToast('Kartu dihapus dari database.');
    });
  };

  // --- POS SALE HANDLER ---
  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (!selectedPosCard) {
      showToast('Pilih kartu terlebih dahulu.', 'error');
      return;
    }
    const deal = parseDotNumber(posDealPrice);
    if (deal <= 0) {
      showToast('Masukkan harga laku yang valid.', 'error');
      return;
    }

    const cost = Number(selectedPosCard.buyPrice) || 0;
    const profit = deal - cost;

    const newTrx = {
      id: `TRX-${Date.now().toString().slice(-5)}`,
      type: 'SALE',
      tcg: selectedPosCard.tcg || 'POKEMON',
      date: new Date().toISOString().slice(0, 10),
      summary: `${selectedPosCard.name} (${selectedPosCard.language} • ${selectedPosCard.grade})`,
      revenue: deal,
      costBasis: cost,
      netProfit: profit,
      notes: posNotes.trim()
    };

    const ok = await persist(async () => {
      const { id, ...transaction } = newTrx;
      const result = await api('/transactions/commit', 'POST', { outgoing: [{id: selectedPosCard.id, soldPrice: deal}], incoming: [], transaction });
      setCards(prev => prev.map(c => result.updated.find(x => x.id === c.id) || c));
      setTransactions(prev => [result.transaction, ...prev]);
    });
    if (!ok) return;
    setPosSelectedCardId('');
    setPosDealPrice('');
    setPosNotes('');
    showToast(`Penjualan "${selectedPosCard.name}" berhasil dicatat!`);
    setActiveTab('sold');
  };

  // --- TRADE-IN HANDLERS ---
  const toggleTradeOutCard = (id) => {
    setTradeOutCardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddTradeInRow = () => {
    setTradeInItems((prev) => [
      ...prev,
      {
        tempId: `TI-${Date.now()}`,
        tcg: 'POKEMON',
        name: '',
        setName: '',
        number: '',
        language: 'JP',
        category: categories[0] || 'Single Card',
        gradingCompany: 'Raw',
        grade: 'Raw NM/M',
        storageLocation: storageLocations[0] || 'Binder 1 - High End',
        valuationCost: '',
        targetSellPrice: '',
        imageUrl: ''
      }
    ]);
  };

  const handleRemoveTradeInRow = (tempId) => {
    setTradeInItems((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleExecuteTradeIn = async (e) => {
    e.preventDefault();
    try {
      const { outCards, validInItems, totalOutCost, totalInValuation, cashDelta, tradeNetProfitImpact } =
        tradeSummary;

      if (outCards.length === 0 && validInItems.length === 0) {
        showToast('Pilih minimal 1 kartu keluar atau isi 1 kartu masuk.', 'error');
        return;
      }

      if (validInItems.some(item => !categories.includes(item.category) || !storageLocations.includes(item.storageLocation))) { showToast('Pilih kategori dan lokasi penyimpanan aktif untuk setiap kartu masuk.', 'error'); return; }
      const newCardsFromTrade = validInItems.map((item, idx) => {
        const valCost = parseDotNumber(item.valuationCost);
        const targetSell = parseDotNumber(item.targetSellPrice) || Math.round(valCost * 1.25);
        return {
          id: `CRD-${Date.now().toString().slice(-4)}${idx}`,
          tcg: item.tcg || 'POKEMON',
          name: item.name.trim(),
          setName: item.setName.trim(),
          number: item.number.trim() || '-',
          language: item.language,
          category: item.category,
          gradingCompany: item.gradingCompany,
          grade: item.grade.trim() || 'Raw NM/M',
          storageLocation: item.storageLocation,
          buyPrice: valCost,
          targetPrice: targetSell,
          soldPrice: null,
          status: 'IN_STOCK',
          imageUrl: item.imageUrl || ''
        };
      });

      const outNames = outCards.map((c) => c.name).join(', ') || 'Tidak ada';
      const inNames = validInItems.map((c) => c.name).join(', ') || 'Tidak ada';
      const allTcgSet = new Set([
        ...outCards.map((c) => c.tcg || 'POKEMON'),
        ...validInItems.map((c) => c.tcg || 'POKEMON')
      ]);
      const resolvedTradeTcg =
        allTcgSet.size > 1 ? 'MIXED' : Array.from(allTcgSet)[0] || 'POKEMON';
      const cashNote =
        cashDelta > 0
          ? `Toko Terima Cash ${formatIDR(cashDelta)}`
          : cashDelta < 0
          ? `Kita Nambah Cash ${formatIDR(Math.abs(cashDelta))}`
          : 'Tukar Guling (0 Cash)';

      const newTrx = {
        id: `TRD-${Date.now().toString().slice(-5)}`,
        type: 'TRADE_IN',
        tcg: resolvedTradeTcg,
        date: new Date().toISOString().slice(0, 10),
        summary: `Keluar: [${outNames}] ⇄ Masuk: [${inNames}]`,
        revenue: totalInValuation + (cashDelta > 0 ? cashDelta : 0),
        costBasis: totalOutCost + (cashDelta < 0 ? Math.abs(cashDelta) : 0),
        netProfit: tradeNetProfitImpact,
        notes: [cashNote, tradeNotes.trim()].filter(Boolean).join(' • ')
      };

      const ok = await persist(async () => {
        const { id, ...transaction } = newTrx;
        if (photoBusy.current) throw new Error('Foto masih diproses');
        const incoming = [];
        for (const {id, ...card} of newCardsFromTrade) {
          card.imageUrl = await uploadPhoto(card.imageUrl);
          incoming.push(card);
        }
        const result = await api('/transactions/commit', 'POST', { outgoing: outCards.map(c => ({id:c.id,soldPrice:c.buyPrice})), incoming, transaction });
        setCards(prev => [...result.created, ...prev.map(c => result.updated.find(x => x.id === c.id) || c)]);
        setTransactions(prev => [result.transaction, ...prev]);
      });
      if (!ok) return;
      setTradeOutCardIds([]);
      setTradeCashAmount('');
      setTradeNotes('');
      setTradeInItems([
        {
          tempId: `TI-${Date.now()}`,
          tcg: 'POKEMON',
          name: '',
          setName: '',
          number: '',
          language: 'JP',
          category: categories[0] || 'Single Card',
          gradingCompany: 'Raw',
          grade: 'Raw NM/M',
          storageLocation: storageLocations[0] || 'Binder 1 - High End',
          valuationCost: '',
          targetSellPrice: '',
          imageUrl: ''
        }
      ]);
      showToast('Transaksi Tukar Tambah berhasil diproses!');
      setActiveTab('inventory');
    } catch (err) {
      console.error('Error completing trade-in:', err);
      showToast('Gagal memproses tukar tambah.', 'error');
    }
  };

  // --- CATEGORY & STORAGE LOCATION MANAGEMENT ---
  const addMaster = async (kind, name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    let created = null;
    const ok = await persist(async () => {
      const result = await api('/master-data/' + kind, 'POST', {name: trimmed});
      created = result.name;
      const setter = kind === 'categories' ? setCategories : setStorageLocations;
      setter(prev => [...new Set([...prev, created])].sort((a,b)=>a.localeCompare(b)));
      showToast(`"${created}" ditambahkan ke database.`);
    });
    return ok ? created : null;
  };
  const handleAddCategory = name => addMaster('categories', name);
  const handleAddStorageLocation = name => addMaster('storage', name);
  const removeMaster = async (kind, name) => {
    if (!window.confirm(`Arsipkan "${name}"? Riwayat kartu terjual tetap disimpan.`)) return;
    await persist(async () => {
      await api('/master-data/' + kind + '/' + encodeURIComponent(name), 'DELETE');
      if (kind === 'categories') {
        const remaining = categories.filter(c => c !== name);
        setCategories(remaining);
        if (filterCategory === name) setFilterCategory('ALL');
        setCardForm(prev => prev.category === name ? {...prev, category: remaining[0] || ''} : prev);
        setTradeInItems(prev => prev.map(row => row.category === name ? {...row, category: remaining[0] || ''} : row));
      } else {
        const remaining = storageLocations.filter(c => c !== name);
        setStorageLocations(remaining);
        if (filterStorage === name) setFilterStorage('ALL');
        if (mobileBinder === name) setMobileBinder(null);
        if (exportStorage === name) setExportStorage('ALL');
        setCardForm(prev => prev.storageLocation === name ? {...prev, storageLocation: remaining[0] || ''} : prev);
        setTradeInItems(prev => prev.map(row => row.storageLocation === name ? {...row, storageLocation: remaining[0] || ''} : row));
      }
      showToast(`"${name}" diarsipkan.`);
    });
  };
  const handleRemoveCategory = name => removeMaster('categories', name);
  const handleRemoveStorageLocation = name => removeMaster('storage', name);

  // --- PROMO CAPTION & CSV EXPORT ---
  const generatePromoCaption = (card) => {
    const tcgHeader = card.tcg === 'ONE_PIECE' ? 'ONE PIECE CARD GAME' : 'POKÉMON TCG';
    const gradeLabel = card.grade && card.grade !== 'Raw' ? `[${card.grade}]` : '[RAW NM/M]';
    const setLine = card.setName ? `\n📦 Set: ${card.setName} (${card.number})` : `\n🔢 Nomor: ${card.number}`;
    return `🔥 FOR SALE - ${tcgHeader} 🔥\n\n🃏 ${card.name} ${gradeLabel}${setLine}\n🌐 Bahasa: ${getLanguageLabel(card.language)}\n💰 Harga: ${formatIDR(card.targetPrice)}\n\n✅ Kondisi terawat & siap kirim dengan packing aman (toploader + bubble wrap).\n📩 Minat / tanya foto detail langsung DM atau WA ya!`;
  };

  const copyToClipboard = async (text, successMsg = 'Teks berhasil disalin ke clipboard!') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast(successMsg);
        return;
      }
    } catch (_) {
      // Fallback ke execCommand di bawah
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (copied) {
        showToast(successMsg);
      } else {
        showToast('Gagal menyalin teks otomatis.', 'error');
      }
    } catch (err) {
      console.error('Clipboard fallback error:', err);
      showToast('Gagal menyalin ke clipboard.', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID Transaksi', 'Tipe', 'Tanggal', 'Ringkasan Item', 'Omzet (IDR)', 'Modal HPP (IDR)', 'Profit Bersih (IDR)', 'Catatan'];
      const rows = filteredTransactions.map((t) => [
        t.id,
        t.type,
        t.date,
        `"${(t.summary || '').replace(/"/g, '""')}"`,
        t.revenue,
        t.costBasis,
        t.netProfit,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const monthSuffix = historyMonthFilter !== 'ALL' ? `_${historyMonthFilter}` : '';
      link.setAttribute('download', `CARDEXX_Laporan${monthSuffix}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Laporan CSV berhasil diunduh!');
    } catch (err) {
      console.error('CSV export error:', err);
      showToast('Gagal mengekspor CSV.', 'error');
    }
  };

  const handleExportHistoryExcel = () => {
    const exportTransactions = transactions.filter(t => exportMonth==='ALL' || String(t.date||'').slice(0,7)===exportMonth);
    try {
      const headers = [
        'ID Transaksi',
        'Tipe',
        'TCG',
        'Tanggal',
        'Ringkasan Item',
        'Omzet / Nilai (IDR)',
        'Modal HPP (IDR)',
        'Profit Bersih (IDR)',
        'Catatan'
      ];
      const rows = exportTransactions.map((t) => [
        t.id,
        t.type === 'SALE' ? 'PENJUALAN' : 'TUKAR TAMBAH',
        t.tcg || 'POKEMON',
        t.date,
        t.summary || '-',
        Number(t.revenue) || 0,
        Number(t.costBasis) || 0,
        Number(t.netProfit) || 0,
        t.notes || '-'
      ]);

      const totalOmzetFiltered = exportTransactions.reduce((sum, t) => sum + (Number(t.revenue) || 0), 0);
      const totalModalFiltered = exportTransactions.reduce((sum, t) => sum + (Number(t.costBasis) || 0), 0);
      const totalProfitFiltered = exportTransactions.reduce((sum, t) => sum + (Number(t.netProfit) || 0), 0);

      const monthSuffix = exportMonth !== 'ALL' ? `_${exportMonth}` : '';
      const periodLabel =
        exportMonth !== 'ALL' ? ` - ${formatMonthLabel(exportMonth)}` : ' - Semua Bulan';

      downloadExcelHtmlSheet({
        filename: `CARDEXX_Riwayat_Laba${monthSuffix}_${new Date().toISOString().slice(0, 10)}.xls`,
        sheetTitle: `CARDEXX Riwayat Transaksi & Laba${periodLabel}`,
        headers,
        rows,
        totalsRow: [
          'TOTAL',
          `${exportTransactions.length} Trx`,
          '',
          '',
          'Total Periode Terfilter',
          totalOmzetFiltered,
          totalModalFiltered,
          totalProfitFiltered,
          ''
        ]
      });
      showToast('Laporan Riwayat & Laba (.xls) berhasil diunduh!');
    } catch (err) {
      console.error('History Excel export error:', err);
      showToast('Gagal mengekspor Excel Riwayat & Laba.', 'error');
    }
  };

  const handleExportInventoryExcel = () => {
    const exportCards = availableInventory.filter(c=>exportStorage==='ALL'||c.storageLocation===exportStorage);
    try {
      const headers = [
        'ID Kartu',
        'TCG',
        'Nama Kartu',
        'Set / Ekspansi',
        'Nomor Kartu',
        'Bahasa',
        'Kategori',
        'Grade / Kondisi',
        'Lokasi Penyimpanan',
        'Modal HPP (IDR)',
        'Target Jual (IDR)',
        'Estimasi Profit (IDR)',
        'Status'
      ];
      const rows = exportCards.map((c) => {
        const buy = Number(c.buyPrice) || 0;
        const target = Number(c.targetPrice) || 0;
        return [
          c.id,
          getTcgMeta(c.tcg).label,
          c.name,
          c.setName || '-',
          c.number || '-',
          `${c.language} (${getLanguageLabel(c.language)})`,
          c.category || '-',
          c.grade || '-',
          c.storageLocation || '-',
          buy,
          target,
          target - buy,
          c.status === 'IN_STOCK' ? 'STOK AKTIF' : 'TERJUAL'
        ];
      });

      const totalBuy = exportCards.reduce((sum, c) => sum + (Number(c.buyPrice) || 0), 0);
      const totalTarget = exportCards.reduce((sum, c) => sum + (Number(c.targetPrice) || 0), 0);
      const totalEstProfit = totalTarget - totalBuy;

      downloadExcelHtmlSheet({
        filename: `CARDEXX_Inventory_Stok_${new Date().toISOString().slice(0, 10)}.xls`,
        sheetTitle: `CARDEXX Inventory Stok Aktif (${exportCards.length} Kartu)`,
        headers,
        rows,
        totalsRow: [
          'TOTAL',
          '',
          `${exportCards.length} Kartu`,
          '',
          '',
          '',
          '',
          '',
          'Total Inventory',
          totalBuy,
          totalTarget,
          totalEstProfit,
          'IN_STOCK'
        ]
      });
      showToast('Data Inventory (.xls) berhasil diunduh!');
    } catch (err) {
      console.error('Inventory Excel export error:', err);
      showToast('Gagal mengekspor Excel Inventory.', 'error');
    }
  };

  // --- IMAGE UPLOAD / CAMERA HANDLER ---
  const handleImageFileUpload = async (e, targetMode = 'CARD_FORM', tradeTempId = null) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || photoBusy.current) return;
    if (!file.type.startsWith('image/') || file.size > 25 * 1024 * 1024) { showToast('Pilih gambar maksimal 25 MB.', 'error'); return; }
    photoBusy.current = true; setProcessingPhoto(true);
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = objectUrl;
      await img.decode();
      const canvas = document.createElement('canvas');
      let scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      let encoded = '';
      for (let i = 0; i < 9; i++) {
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        encoded = canvas.toDataURL('image/jpeg', Math.max(0.55, 0.88 - i * 0.06));
        if (encoded.length <= 800000 && encoded.startsWith('data:image/jpeg;base64,')) break;
        scale *= 0.8;
      }
      if (!encoded.startsWith('data:image/jpeg;base64,') || encoded.length > 800000) throw new Error('Foto tidak dapat dikompres');
      if (targetMode === 'CARD_FORM') setCardForm(prev => ({...prev, imageUrl:encoded}));
      else setTradeInItems(prev => prev.map(row => row.tempId === tradeTempId ? {...row,imageUrl:encoded} : row));
      showToast('Foto siap diunggah saat disimpan.');
    } catch (error) { showToast('Gagal memproses foto: ' + error.message, 'error'); }
    finally { URL.revokeObjectURL(objectUrl); photoBusy.current = false; setProcessingPhoto(false); }
  };

  const openCardDetail = (card) => setSelectedDetailCard(card);

  if (connection === 'loading') return (
    <main role="status" aria-live="polite" aria-busy="true" style={{minHeight:'100dvh',display:'grid',placeItems:'center',background:'#f5f7f8',padding:24,textAlign:'center',color:'#065f46'}}>
      <style>{`@keyframes cxLoadingSpin { to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce) { .cx-loading-ring { animation: none !important; } }`}</style>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        <div style={{position:'relative',width:104,height:104,display:'grid',placeItems:'center',marginBottom:8}}>
          <div aria-hidden="true" className="cx-loading-ring" style={{position:'absolute',inset:0,border:'3px solid #d1fae5',borderTopColor:'#059669',borderRightColor:'#fbbf24',borderRadius:'50%',animation:'cxLoadingSpin 1.15s linear infinite'}} />
          <RayquazaLogo className="w-16 h-16" />
        </div>
        <h1 style={{fontSize:28,fontWeight:900,letterSpacing:3,margin:0}}>CARDEXX</h1>
        <p style={{fontSize:12,letterSpacing:2,color:'#64748b',margin:0}}>TCG WORKSPACE</p>
      </div>
    </main>
  );
  if (connection === 'error') return <div className="min-h-screen bg-slate-50 text-slate-800 p-8"><h1 className="text-xl font-bold text-emerald-700">CARDEXX</h1><p className="my-4">{'Koneksi database gagal: ' + connectionError}</p><button className="bg-emerald-700 text-white rounded px-4 py-2" onClick={loadData}>Coba lagi</button></div>;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500/30 selection:text-emerald-700 relative overflow-x-hidden">
      {(saving || processingPhoto) && <div className="fixed inset-0 z-[100] bg-slate-950/50 flex items-center justify-center" role="status"><span className="bg-white p-4 rounded-xl">{processingPhoto ? "Mengompres foto..." : "Menyimpan ke database..."}</span></div>}
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[90] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-xs sm:text-sm font-bold transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-500/50 text-rose-700'
              : 'bg-white border-emerald-500/50 text-emerald-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <header className="cx-header">
        <div className="cx-top">
          <div className="cx-brand"><RayquazaLogo className="w-9 h-9"/><div><h1>CARDEXX</h1><p>TCG workspace</p></div></div>
          <button type="button" className="cx-add" onClick={handleOpenAddCard}><Plus className="w-5 h-5"/> <span>Tambah kartu</span></button>
        </div>
        <nav className="cx-nav" aria-label="Navigasi utama">
          {[
            {id:'dashboard',label:'Beranda',icon:LayoutDashboard},
            {id:'inventory',label:'Stok',icon:Package},
            {id:'pos',label:'Kasir',icon:ShoppingBag},
            {id:'add-card',label:'Tambah kartu',icon:Plus},
            {id:'trade',label:'Trade-in',icon:ArrowLeftRight},
            {id:'history',label:'Laporan',icon:BarChart3},
            {id:'settings',label:'Kelola',icon:Tags}
          ].map(({id,label,icon:Icon}) => {
            if (id === 'add-card') return <button key={id} type="button" className="cx-nav-add" aria-label="Tambah kartu" title="Tambah kartu" onClick={handleOpenAddCard}><Icon aria-hidden="true" /></button>;
            const active = id === 'history' ? ['history','sold','binders'].includes(activeTab) : activeTab === id;
            return <button key={id} type="button" aria-current={active?'page':undefined} className={active?'cx-current':''} onClick={()=>{if(id==='inventory' && activeTab!==id && window.matchMedia('(max-width:639px)').matches){setMobileBinder(null);setFilterStorage('ALL');}setActiveTab(id);}}><Icon className="w-5 h-5"/><span>{label}</span></button>;
          })}
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="cx-main relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-5">
        <div className="cx-page-title"><h2>{{dashboard:'Ringkasan toko',inventory:'Stok kartu',pos:'Kasir',trade:'Tukar tambah',history:'Laporan',sold:'Laporan',binders:'Laporan binder',settings:'Kelola toko'}[activeTab]}</h2><p>{{dashboard:'Pantau aset dan performa koleksi.',inventory:'Kelola koleksi Pokémon dan One Piece.',pos:'Catat penjualan kartu.',trade:'Kelola pertukaran kartu.',history:'Pantau transaksi dan laba.',sold:'Arsip kartu yang telah keluar.',binders:'Nilai aset dan kartu keluar berdasarkan lokasi.',settings:'Atur kategori dan lokasi penyimpanan.'}[activeTab]}</p></div>
        {['history','sold','binders'].includes(activeTab) && <nav className="cx-subnav" aria-label="Laporan"><button type="button" className={activeTab==='history'?'cx-current':''} onClick={()=>setActiveTab('history')}>Riwayat & laba</button><button type="button" className={activeTab==='sold'?'cx-current':''} onClick={()=>setActiveTab('sold')}>Kartu terjual ({analytics.soldCount})</button><button type="button" className={activeTab==='binders'?'cx-current':''} onClick={()=>setActiveTab('binders')}>Per binder</button></nav>}
        {activeTab==='binders' && <section className="space-y-3">
          <select aria-label="Pilih lokasi laporan" value={binderFilter} onChange={e=>setBinderFilter(e.target.value)} className="w-full sm:w-72 px-3 py-2 rounded-xl border border-slate-200 bg-white"><option value="ALL">Semua lokasi</option>{[...new Set([...storageLocations,...cards.map(c=>c.storageLocation||'Tanpa lokasi')])].map(loc=><option key={loc}>{loc}</option>)}</select>
          <p className="text-xs text-slate-500">Laporan berdasarkan lokasi kartu yang tercatat saat ini. Nilai keluar mencakup SOLD dan trade-in; bukan omzet kas atau laba transaksi final.</p>
          {[...new Set([...storageLocations,...cards.map(c=>c.storageLocation||'Tanpa lokasi')])].filter(loc=>binderFilter==='ALL'||loc===binderFilter).map(loc=>{
            const all=cards.filter(c=>(c.storageLocation||'Tanpa lokasi')===loc), active=all.filter(c=>c.status==='IN_STOCK'), sold=all.filter(c=>c.status==='SOLD');
            const total=(items,key)=>items.reduce((n,c)=>n+(Number(c[key])||0),0);
            const cost=total(active,'buyPrice'), target=total(active,'targetPrice'), out=total(sold,'soldPrice'), outCost=total(sold,'buyPrice');
            return <article key={loc} className="rounded-2xl bg-white border border-slate-200 p-4"><div className="flex justify-between gap-2 items-center mb-3"><h3 className="font-bold text-slate-900">{loc}</h3><span className="text-xs text-slate-500">{active.length} aktif · {sold.length} keluar</span></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{[['Modal stok',cost],['Target jual',target],['Potensi laba',target-cost],['HPP kartu keluar',outCost],['Nilai kartu keluar',out],['Selisih nilai keluar',out-outCost]].map(([label,value])=><div key={label} className="rounded-xl bg-slate-50 p-3"><div className="text-xs text-slate-500">{label}</div><div className="font-bold text-sm text-emerald-800 break-words">{formatIDR(value)}</div></div>)}</div></article>;
          })}
        </section>}
        {activeTab==='settings' && <div className="cx-settings"><button type="button" onClick={()=>setIsCategoryModalOpen(true)}><Tags className="w-5 h-5"/> Kategori <span>{categories.length}</span></button><button type="button" onClick={()=>setIsStorageModalOpen(true)}><FolderArchive className="w-5 h-5"/> Penyimpanan <span>{storageLocations.length}</span></button></div>}
        {activeTab==='settings' && <section className="rounded-2xl bg-white border border-slate-200 p-4 mt-4 space-y-4"><h3 className="font-bold flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-emerald-700"/> Export Excel</h3><div className="grid sm:grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3 space-y-2"><label className="block text-sm font-bold">Inventory stok aktif</label><select aria-label="Lokasi untuk ekspor stok" value={exportStorage} onChange={e=>setExportStorage(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2"><option value="ALL">Semua penyimpanan</option>{storageLocations.map(loc=><option key={loc}>{loc}</option>)}</select><button type="button" className="cx-export-button" onClick={handleExportInventoryExcel}><Download className="w-4 h-4"/> Export stok (.xls)</button></div><div className="rounded-xl bg-slate-50 p-3 space-y-2"><label className="block text-sm font-bold">Riwayat &amp; laba</label><select aria-label="Bulan untuk ekspor riwayat" value={exportMonth} onChange={e=>setExportMonth(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2"><option value="ALL">Semua bulan</option>{availableMonths.map(ym=><option key={ym} value={ym}>{formatMonthLabel(ym)}</option>)}</select><button type="button" className="cx-export-button" onClick={handleExportHistoryExcel}><Download className="w-4 h-4"/> Export riwayat (.xls)</button></div></div></section>}
        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* 4 Compact KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white border border-slate-200 p-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500" />
                <div className="flex items-center justify-between text-slate-600 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Modal Tertahan</span>
                  <Wallet className="w-4 h-4 text-sky-700" />
                </div>
                <p className="text-base sm:text-lg font-black text-slate-900">{formatIDR(analytics.totalModalStok)}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{analytics.inStockCount} kartu aktif</p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="flex items-center justify-between text-slate-600 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Estimasi Nilai Stok</span>
                  <Sparkles className="w-4 h-4 text-amber-800" />
                </div>
                <p className="text-base sm:text-lg font-black text-amber-800">{formatIDR(analytics.totalEstimasiJual)}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Potensi +{formatIDR(analytics.potensiProfitStok)}
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500" />
                <div className="flex items-center justify-between text-slate-600 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Omzet Terealisasi</span>
                  <TrendingUp className="w-4 h-4 text-teal-700" />
                </div>
                <p className="text-base sm:text-lg font-black text-slate-900">{formatIDR(analytics.totalOmzet)}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{transactions.length} transaksi tercatat</p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-400 to-lime-400" />
                <div className="flex items-center justify-between text-slate-600 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Laba Bersih Aktual</span>
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                </div>
                <p
                  className={`text-base sm:text-lg font-black ${
                    analytics.totalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {analytics.totalNetProfit >= 0 ? '+' : ''}
                  {formatIDR(analytics.totalNetProfit)}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">Selisih harga laku - modal</p>
              </div>
            </div>

            {/* BUSINESS FINANCIAL FLOWCHART */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                    <span>Flowchart Arus Keuangan & Perputaran Modal Bisnis</span>
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Alur perputaran modal dari belanja stok hingga realisasi kas & laba bersih
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-emerald-700">
                  ROI Stok Aktif:{' '}
                  {analytics.totalModalStok > 0
                    ? Math.round((analytics.potensiProfitStok / analytics.totalModalStok) * 100)
                    : 0}
                  %
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-11 gap-2 items-center pt-1">
                <div className="lg:col-span-2 p-3 rounded-2xl bg-slate-50 border border-sky-500/35 relative">
                  <span className="text-[10px] font-extrabold uppercase text-sky-700 block">
                    1. Total Modal Masuk
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {formatIDR(analytics.totalModalKeseluruhan)}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Stok Aktif + Modal Terjual
                  </p>
                </div>

                <div className="hidden lg:flex lg:col-span-1 justify-center text-slate-500">
                  <ArrowRight className="w-5 h-5 text-emerald-500/70" />
                </div>

                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-amber-500/35">
                    <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                      2A. Aset di Brankas
                    </span>
                    <p className="text-xs sm:text-sm font-black text-amber-800 mt-1">
                      {formatIDR(analytics.totalModalStok)}
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Pokémon ({analytics.pokemonCount})</span>
                        <span className="text-slate-700 font-semibold">{formatIDR(analytics.pokemonModal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>One Piece ({analytics.onePieceCount})</span>
                        <span className="text-slate-700 font-semibold">{formatIDR(analytics.onePieceModal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-teal-500/35">
                    <span className="text-[10px] font-extrabold uppercase text-teal-700 block">
                      2B. Modal Terlikuidasi
                    </span>
                    <p className="text-xs sm:text-sm font-black text-teal-700 mt-1">
                      {formatIDR(analytics.totalCostSold)}
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Omzet Masuk</span>
                        <span className="text-emerald-700 font-semibold">{formatIDR(analytics.totalOmzet)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Item Terjual</span>
                        <span className="text-slate-700 font-semibold">{analytics.soldCount} kartu</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex lg:col-span-1 justify-center text-slate-500">
                  <ArrowRight className="w-5 h-5 text-emerald-500/70" />
                </div>

                <div className="lg:col-span-3 p-3 rounded-2xl bg-slate-50 border border-emerald-500/40 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">
                    3. Kas Laba & Proyeksi
                  </span>
                  <p
                    className={`text-sm font-black ${
                      analytics.totalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {analytics.totalNetProfit >= 0 ? '+' : ''}
                    {formatIDR(analytics.totalNetProfit)}
                  </p>
                  <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Est. Nilai Stok</span>
                      <span className="text-amber-800 font-semibold">
                        {formatIDR(analytics.totalEstimasiJual)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potensi Profit</span>
                      <span className="text-emerald-700 font-semibold">
                        +{formatIDR(analytics.potensiProfitStok)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Asset Distribution */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Distribusi Kategori Stok Aktif</span>
                </h3>
                <span className="text-[11px] text-slate-600">{analytics.inStockCount} Item</span>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {analytics.categoryStats.map((cat) => {
                  const pct =
                    analytics.totalModalStok > 0
                      ? Math.round((cat.modal / analytics.totalModalStok) * 100)
                      : 0;
                  return (
                    <div key={cat.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700">
                          {cat.name} <span className="text-slate-500">({cat.count})</span>
                        </span>
                        <span className="font-extrabold text-emerald-700">{formatIDR(cat.modal)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: INVENTORY AKTIF ==================== */}
        {activeTab === 'inventory' && <section className="cx-binder-picker" hidden={mobileBinder!==null}>
          <h3 className="font-bold text-slate-900 mb-2">Pilih lokasi penyimpanan</h3>
          <p className="text-xs text-slate-500 mb-3">Buka binder untuk melihat kartu di dalamnya.</p>
          <div className="grid grid-cols-2 gap-2">{['ALL',...storageLocations].map(loc=>{const count=availableInventory.filter(c=>loc==='ALL'||c.storageLocation===loc).length;return <button key={loc} type="button" className="cx-binder-tile" onClick={()=>{setMobileBinder(loc);setFilterStorage(loc);setSearchQuery('');setFilterTcg('ALL');setFilterCategory('ALL');setFilterLanguage('ALL');setFilterGrading('ALL');}}><FolderArchive className="w-5 h-5 text-emerald-700"/><strong>{loc==='ALL'?'Semua kartu':loc}</strong><span>{count} kartu aktif</span></button>})}</div>
        </section>}
        {activeTab === 'inventory' && (
          <div className={`space-y-4 ${mobileBinder===null?'cx-mobile-inventory-hidden':''}`}>
            <div className="cx-binder-back"><button type="button" onClick={()=>{setMobileBinder(null);setFilterStorage('ALL');}} className="cx-filter-toggle">← Pilih binder</button><strong>{mobileBinder==='ALL'?'Semua kartu':mobileBinder}</strong></div>
            <div className="rounded-2xl bg-white border border-slate-200 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFilterTcg('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      filterTcg === 'ALL'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-700'
                    }`}
                  >
                    Semua TCG ({analytics.inStockCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTcg('POKEMON')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      filterTcg === 'POKEMON'
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    Pokémon ({analytics.pokemonCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTcg('ONE_PIECE')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      filterTcg === 'ONE_PIECE'
                        ? 'bg-rose-700 text-white'
                        : 'text-slate-600 hover:text-rose-700'
                    }`}
                  >
                    One Piece ({analytics.onePieceCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600">
                    Menampilkan <strong className="text-slate-700">{filteredCards.length}</strong> kartu aktif
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama kartu, set, nomor (mis. OP05-119 / 349/190), grade, atau binder..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button type="button" className="cx-filter-toggle" aria-expanded={showFilters} onClick={()=>setShowFilters(v=>!v)}>{showFilters?'Tutup filter':'Filter lainnya'}</button>
                <div className={`${showFilters?'grid':'hidden'} grid-cols-2 sm:grid items-center gap-2 cx-filters`}>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Semua Bahasa</option>
                    {POKEMON_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.code} - {lang.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterGrading}
                    onChange={(e) => setFilterGrading(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Semua Grade/Raw</option>
                    {GRADING_COMPANIES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterStorage}
                    onChange={(e) => {setFilterStorage(e.target.value);if(mobileBinder!==null)setMobileBinder(e.target.value);}}
                    className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Semua Penyimpanan</option>
                    {storageLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredCards.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-10 text-center">
                <Package className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Tidak ada kartu stok aktif yang cocok</p>
                <p className="text-xs text-slate-500 mt-1">
                  Coba ubah filter pencarian atau tambahkan kartu baru ke inventory.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {filteredCards.map((card) => {
                  const estProfit = card.targetPrice - card.buyPrice;
                  const gradingCo = card.gradingCompany || getGradingCompany(card.grade);
                  const tcgMeta = getTcgMeta(card.tcg);

                  return (
                    <div
                      key={card.id}
                      onClick={() => openCardDetail(card)}
                      className="cx-card group cursor-pointer rounded-2xl bg-white hover:bg-white border border-slate-200 hover:border-emerald-500/50 transition-all overflow-hidden flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <div className="relative h-40 bg-slate-50 overflow-hidden border-b border-slate-200">
                          {card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.name}
                              loading="lazy" decoding="async" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-3">
                              <RayquazaLogo className="w-12 h-12 opacity-60" />
                              <span className="text-[10px] font-bold text-slate-500 mt-1">
                                {tcgMeta.label.toUpperCase()}
                              </span>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1 max-w-[78%]">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-black border ${tcgMeta.badgeClass}`}
                            >
                              {card.tcg === 'ONE_PIECE' ? 'OP' : 'PKM'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-extrabold text-amber-800">
                              {card.language}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                gradingCo === 'Raw'
                                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                                  : 'bg-emerald-50 border-emerald-500/40 text-emerald-700'
                              }`}
                            >
                              {card.grade}
                            </span>
                          </div>

                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditCard(e, card)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-500 text-slate-700 hover:text-slate-950 border border-slate-200 transition"
                              title="Edit Kartu"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCard(e, card.id)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-500 text-slate-700 hover:text-slate-900 border border-slate-200 transition"
                              title="Hapus Kartu"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 space-y-2">
                          <div>
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition">
                              {card.name}
                            </h3>
                            <p className="text-[11px] text-slate-600 truncate">
                              {card.setName ? (
                                <>
                                  {card.setName} •{' '}
                                  <span className="text-slate-700 font-semibold">{card.number}</span>
                                </>
                              ) : (
                                <span className="text-slate-700 font-semibold">No. {card.number}</span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                            <span className="truncate">{card.category}</span>
                            <span className="text-emerald-700 font-bold truncate max-w-[110px]">
                              {card.storageLocation}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="block text-[10px] text-slate-500">Modal HPP</span>
                              <span className="text-xs font-bold text-slate-700">{formatIDR(card.buyPrice)}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 border border-emerald-500/20">
                              <span className="block text-[10px] text-emerald-700">Target Jual</span>
                              <span className="text-xs font-extrabold text-emerald-700">
                                {formatIDR(card.targetPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 pb-3 pt-1 space-y-2">
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <span className="text-[10px] font-bold text-emerald-700">
                            Est. +{formatIDR(estProfit)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPosSelectedCardId(card.id);
                              setPosDealPrice(formatDotInput(card.targetPrice));
                              setActiveTab('pos');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 hover:text-slate-950 text-[11px] font-extrabold transition"
                          >
                            Jual
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: ARCHIVE KARTU SOLD ==================== */}
        {activeTab === 'sold' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Archive className="w-4 h-4 text-amber-800" />
                    <span>Arsip Kartu Terjual ({soldCards.length})</span>
                  </h2>
                  <p className="text-xs text-slate-600">
                    Total Profit dari Kartu Terjual:{' '}
                    <span className="text-emerald-700 font-bold">
                      {formatIDR(
                        soldCards.reduce((sum, c) => sum + ((c.soldPrice || 0) - (c.buyPrice || 0)), 0)
                      )}
                    </span>
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={soldSearchQuery}
                    onChange={(e) => setSoldSearchQuery(e.target.value)}
                    placeholder="Cari arsip kartu sold..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSoldFilterTcg('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      soldFilterTcg === 'ALL'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-700'
                    }`}
                  >
                    Semua TCG ({cards.filter((c) => c.status === 'SOLD').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoldFilterTcg('POKEMON')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      soldFilterTcg === 'POKEMON'
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    Pokémon ({cards.filter((c) => c.status === 'SOLD' && (c.tcg || 'POKEMON') === 'POKEMON').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoldFilterTcg('ONE_PIECE')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      soldFilterTcg === 'ONE_PIECE'
                        ? 'bg-rose-700 text-white'
                        : 'text-slate-600 hover:text-rose-700'
                    }`}
                  >
                    One Piece ({cards.filter((c) => c.status === 'SOLD' && c.tcg === 'ONE_PIECE').length})
                  </button>
                </div>
              </div>
            </div>

            {soldCards.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-10 text-center">
                <Archive className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Belum ada kartu berstatus Sold untuk filter ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {soldCards.map((card) => {
                  const realizedProfit = (card.soldPrice || 0) - (card.buyPrice || 0);
                  const tcgMeta = getTcgMeta(card.tcg);
                  return (
                    <div
                      key={card.id}
                      onClick={() => openCardDetail(card)}
                      className="cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-amber-500/40 overflow-hidden transition"
                    >
                      <div className="relative h-36 bg-slate-50 border-b border-slate-200">
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            loading="lazy" decoding="async" className="w-full h-full object-contain p-2 opacity-85"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <RayquazaLogo className="w-10 h-10 opacity-40" />
                            <span className="text-[10px] font-bold text-slate-500 mt-1">
                              {tcgMeta.label.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-black border ${tcgMeta.badgeClass}`}
                          >
                            {card.tcg === 'ONE_PIECE' ? 'OP' : 'PKM'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-[10px] font-extrabold text-rose-700">
                            SOLD • {card.language}
                          </span>
                        </div>
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700">
                          {card.grade}
                        </span>
                      </div>

                      <div className="p-3 space-y-2">
                        <div>
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-700 truncate">{card.name}</h3>
                          <p className="text-[11px] text-slate-500 truncate">
                            {card.setName ? `${card.setName} • ${card.number}` : `No. ${card.number}`}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="block text-[10px] text-slate-500">Modal</span>
                            <span className="font-bold text-slate-700">{formatIDR(card.buyPrice)}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-amber-500/20">
                            <span className="block text-[10px] text-amber-800">Laku Di</span>
                            <span className="font-extrabold text-amber-800">{formatIDR(card.soldPrice)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                          <span className="text-slate-500">Profit Bersih</span>
                          <span
                            className={`font-extrabold ${
                              realizedProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {realizedProfit >= 0 ? '+' : ''}
                            {formatIDR(realizedProfit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: KASIR / PENJUALAN (POS) ==================== */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>Pilih Kartu Terjual dari Stok</span>
                </h2>
                <span className="text-xs text-slate-600">{posFilteredInventory.length} stok tersedia</span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={posSearchQuery}
                  onChange={(e) => setPosSearchQuery(e.target.value)}
                  placeholder="Cari nama kartu, nomor, set, atau grade di kasir..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {posFilteredInventory.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    Tidak ada kartu stok aktif yang cocok dengan pencarian.
                  </p>
                ) : (
                  posFilteredInventory.map((card) => {
                    const isSelected = card.id === posSelectedCardId;
                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          setPosSelectedCardId(card.id);
                          setPosDealPrice(formatDotInput(card.targetPrice));
                        }}
                        className={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900 truncate">{card.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-amber-800">
                              {card.language}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-[10px] font-bold text-emerald-700">
                              {card.grade}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">
                            {card.setName ? `${card.setName} (${card.number})` : `No. ${card.number}`} • Modal: {formatIDR(card.buyPrice)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-emerald-700">
                            {formatIDR(card.targetPrice)}
                          </span>
                          <span className="block text-[10px] text-slate-500">Target</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <form
              onSubmit={handleCompleteSale}
              className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-4 space-y-4 h-fit"
            >
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-800" />
                <span>Input Harga Deal & Selesaikan</span>
              </h2>

              {selectedPosCard ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-emerald-500/30 space-y-1">
                  <p className="text-xs font-extrabold text-emerald-700">{selectedPosCard.name}</p>
                  <p className="text-[11px] text-slate-600">
                    {selectedPosCard.setName ? `${selectedPosCard.setName} • ` : ''}
                    {selectedPosCard.number} • {selectedPosCard.grade}
                  </p>
                  <p className="text-[11px] text-slate-700 pt-1">
                    Modal Kartu (HPP): <span className="font-bold">{formatIDR(selectedPosCard.buyPrice)}</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
                  Klik salah satu kartu di sebelah kiri terlebih dahulu.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Laku Di Harga / Deal Price (IDR) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={posDealPrice}
                  onChange={(e) => setPosDealPrice(formatDotInput(e.target.value))}
                  placeholder="Contoh: 3.500.000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-extrabold text-amber-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan Transaksi (Opsional)
                </label>
                <input
                  type="text"
                  value={posNotes}
                  onChange={(e) => setPosNotes(e.target.value)}
                  placeholder="Misal: COD Bandung / Transfer BCA"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Harga Laku</span>
                  <span className="font-bold text-slate-900">{formatIDR(posCalculation.deal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Modal HPP</span>
                  <span className="font-bold text-slate-700">- {formatIDR(posCalculation.cost)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-700">Laba Bersih</span>
                  <span
                    className={`text-sm font-black ${
                      posCalculation.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {posCalculation.profit >= 0 ? '+' : ''}
                    {formatIDR(posCalculation.profit)} ({posCalculation.marginPct}%)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedPosCard}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs sm:text-sm font-extrabold shadow-sm shadow-emerald-500/20 transition"
              >
                Konfirmasi Terjual & Masuk Arsip Sold
              </button>
            </form>
          </div>
        )}

        {/* ==================== TAB 5: TUKAR TAMBAH (TRADE-IN) ==================== */}
        {activeTab === 'trade' && (
          <form onSubmit={handleExecuteTradeIn} className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Skema Selisih Uang Tunai (Cash)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'STORE_RECEIVES', label: '+ Toko Terima' },
                    { id: 'STORE_PAYS', label: '- Kita Nambah' },
                    { id: 'EVEN', label: 'Tukar Guling (0)' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTradeCashFlowType(opt.id)}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-extrabold border transition ${
                        tradeCashFlowType === opt.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nominal Cash (IDR)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={tradeCashFlowType === 'EVEN'}
                  value={tradeCashFlowType === 'EVEN' ? '0' : tradeCashAmount}
                  onChange={(e) => setTradeCashAmount(formatDotInput(e.target.value))}
                  placeholder="Contoh: 1.500.000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-extrabold text-amber-800 disabled:opacity-40 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-rose-700">
                    Kartu Toko yang Keluar ({tradeOutCardIds.length})
                  </h3>
                  <span className="text-[11px] text-slate-600">
                    Modal Keluar: {formatIDR(tradeSummary.totalOutCost)}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tradeOutSearch}
                    onChange={(e) => setTradeOutSearch(e.target.value)}
                    placeholder="Cari kartu stok toko yang keluar..."
                    className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                  />
                  {tradeOutSearch && (
                    <button
                      type="button"
                      onClick={() => setTradeOutSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500">Centang beberapa kartu sekaligus. Pilihan tetap tersimpan saat mencari kartu lain.</p>
                {tradeSummary.outCards.length>0 && <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 space-y-1"><div className="flex items-center justify-between"><strong className="text-xs text-rose-700">{tradeSummary.outCards.length} kartu dipilih</strong><button type="button" onClick={()=>setTradeOutCardIds([])} className="text-xs text-rose-700">Hapus semua</button></div>{tradeSummary.outCards.map(c=><div key={c.id} className="flex items-center justify-between gap-2 text-xs"><span>{c.name}</span><button type="button" aria-label={`Batalkan ${c.name}`} onClick={()=>toggleTradeOutCard(c.id)}><X className="w-4 h-4"/></button></div>)}</div>}
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {filteredTradeOutInventory.map((card) => {
                    const checked = tradeOutCardIds.includes(card.id);
                    return (
                      <label
                        key={card.id}
                        className={`cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                          checked
                            ? 'bg-rose-50 border-rose-400'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-200'
                        }`}
                      >
                        <input type="checkbox" checked={checked} onChange={()=>toggleTradeOutCard(card.id)} className="w-4 h-4 shrink-0 accent-rose-600"/>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {card.name} ({card.language} • {card.grade})
                          </p>
                          <p className="text-[10px] text-slate-600 truncate">
                            {card.setName ? `${card.setName} • ${card.number}` : `No. ${card.number}`}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-700 shrink-0">
                          {formatIDR(card.buyPrice)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-emerald-700">
                    Kartu Masuk ke Inventory ({tradeInItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddTradeInRow}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-bold text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Kartu Masuk</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {tradeInItems.map((item, idx) => (
                    <div
                      key={item.tempId}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-emerald-700">
                          Kartu Masuk #{idx + 1}
                        </span>
                        {tradeInItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTradeInRow(item.tempId)}
                            className="text-[11px] text-rose-700 hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={item.tcg || 'POKEMON'}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId ? { ...row, tcg: e.target.value } : row
                              )
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700"
                        >
                          {TCG_GAMES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId ? { ...row, name: e.target.value } : row
                              )
                            )
                          }
                          placeholder="Nama Kartu (Mew ex / Luffy)"
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          value={item.number}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId ? { ...row, number: e.target.value } : row
                              )
                            )
                          }
                          placeholder="Nomor (205/165 / OP05-119)"
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={item.language}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId ? { ...row, language: e.target.value } : row
                              )
                            )
                          }
                          className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          {POKEMON_LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.code}
                            </option>
                          ))}
                        </select>

                        <select
                          value={item.gradingCompany}
                          onChange={(e) => {
                            const co = e.target.value;
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId
                                  ? {
                                      ...row,
                                      gradingCompany: co,
                                      grade: co === 'Raw' ? 'Raw NM/M' : `${co} 10`
                                    }
                                  : row
                              )
                            );
                          }}
                          className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          {GRADING_COMPANIES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={item.grade}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId ? { ...row, grade: e.target.value } : row
                              )
                            )
                          }
                          placeholder="Grade (PSA 10 / Raw)"
                          className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId ? { ...row, category: e.target.value } : row
                              )
                            )
                          }
                          className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>

                        <select
                          value={item.storageLocation}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId
                                  ? { ...row, storageLocation: e.target.value }
                                  : row
                              )
                            )
                          }
                          className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          {storageLocations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.valuationCost}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId
                                  ? { ...row, valuationCost: formatDotInput(e.target.value) }
                                  : row
                              )
                            )
                          }
                          placeholder="Valuasi Deal / Jadi HPP (mis. 2.000.000)"
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-amber-800 font-bold"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.targetSellPrice}
                          onChange={(e) =>
                            setTradeInItems((prev) =>
                              prev.map((row) =>
                                row.tempId === item.tempId
                                  ? { ...row, targetSellPrice: formatDotInput(e.target.value) }
                                  : row
                              )
                            )
                          }
                          placeholder="Target Harga Jual (mis. 2.500.000)"
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-emerald-700 font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-600">
                  Valuasi Kartu Masuk:{' '}
                  <span className="font-bold text-emerald-700">{formatIDR(tradeSummary.totalInValuation)}</span> •
                  Modal Kartu Keluar:{' '}
                  <span className="font-bold text-rose-700">{formatIDR(tradeSummary.totalOutCost)}</span>
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Dampak Laba Bersih Trade-In:{' '}
                  <span
                    className={
                      tradeSummary.tradeNetProfitImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }
                  >
                    {tradeSummary.tradeNetProfitImpact >= 0 ? '+' : ''}
                    {formatIDR(tradeSummary.tradeNetProfitImpact)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tradeNotes}
                  onChange={(e) => setTradeNotes(e.target.value)}
                  placeholder="Catatan trade-in (opsional)..."
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-extrabold shrink-0 shadow-sm"
                >
                  Proses Tukar Tambah
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ==================== TAB 6: RIWAYAT & LABA ==================== */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap flex-1 items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Cari ID transaksi, nama kartu, tanggal, catatan..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="relative flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-amber-800 absolute left-2.5 pointer-events-none" />
                  <select
                    value={historyMonthFilter}
                    onChange={(e) => setHistoryMonthFilter(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-amber-800 focus:outline-none focus:border-amber-400"
                    title="Filter Bulan Transaksi"
                  >
                    <option value="ALL">Semua Bulan</option>
                    {availableMonths.map((ym) => (
                      <option key={ym} value={ym}>
                        {formatMonthLabel(ym)} ({ym})
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={historyTcgFilter}
                  onChange={(e) => setHistoryTcgFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <option value="ALL">Semua TCG</option>
                  <option value="POKEMON">Pokémon</option>
                  <option value="ONE_PIECE">One Piece</option>
                  <option value="MIXED">Campuran (Trade)</option>
                </select>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <option value="ALL">Semua Tipe</option>
                  <option value="SALE">Penjualan (POS)</option>
                  <option value="TRADE_IN">Tukar Tambah</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-sky-700" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
              <div className="max-h-[460px] overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">ID & Tanggal</th>
                      <th className="py-2.5 px-3">TCG</th>
                      <th className="py-2.5 px-3">Tipe</th>
                      <th className="py-2.5 px-3">Ringkasan Item</th>
                      <th className="py-2.5 px-3 text-right">Omzet / Nilai</th>
                      <th className="py-2.5 px-3 text-right">Modal HPP</th>
                      <th className="py-2.5 px-3 text-right">Profit Bersih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {filteredTransactions.map((trx) => {
                      const trxTcg = trx.tcg || 'POKEMON';
                      return (
                        <tr key={trx.id} className="hover:bg-slate-100 transition">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-700 block">{trx.id}</span>
                            <span className="text-[10px] text-slate-500">{trx.date}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {trxTcg === 'ONE_PIECE' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500/15 text-rose-700 border border-rose-500/30">
                                One Piece
                              </span>
                            ) : trxTcg === 'MIXED' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                PKM + OP
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                                Pokémon
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                trx.type === 'SALE'
                                  ? 'bg-emerald-500/15 text-emerald-700'
                                  : 'bg-amber-500/15 text-amber-800'
                              }`}
                            >
                              {trx.type === 'SALE' ? 'PENJUALAN' : 'TUKAR TAMBAH'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-700">{trx.summary}</p>
                            {trx.notes && <p className="text-[10px] text-slate-500">{trx.notes}</p>}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-700 whitespace-nowrap">
                            {formatIDR(trx.revenue)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">
                            {formatIDR(trx.costBasis)}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-extrabold whitespace-nowrap ${
                              trx.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {trx.netProfit >= 0 ? '+' : ''}
                            {formatIDR(trx.netProfit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== MODAL 1: CARD DETAIL ==================== */}
      {selectedDetailCard && (
        <div
          onClick={() => setSelectedDetailCard(null)}
          className="cx-modal fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-xl p-4 sm:p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${
                      getTcgMeta(selectedDetailCard.tcg).badgeClass
                    }`}
                  >
                    {getTcgMeta(selectedDetailCard.tcg).label}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[11px] font-extrabold text-amber-800">
                    {selectedDetailCard.language} • {getLanguageLabel(selectedDetailCard.language)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-extrabold text-emerald-700">
                    {selectedDetailCard.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-700">
                    {selectedDetailCard.storageLocation}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-slate-900">{selectedDetailCard.name}</h2>
                <p className="text-xs text-slate-600">
                  {selectedDetailCard.setName ? `${selectedDetailCard.setName} • ` : ''}
                  Nomor: <span className="text-slate-700 font-bold">{selectedDetailCard.number}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailCard(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4 rounded-2xl bg-slate-50 border border-slate-200 h-52 flex items-center justify-center p-2">
                {selectedDetailCard.imageUrl ? (
                  <img
                    src={selectedDetailCard.imageUrl}
                    alt={selectedDetailCard.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <RayquazaLogo className="w-16 h-16 opacity-50" />
                )}
              </div>

              <div className="sm:col-span-8 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] text-slate-500">Modal HPP</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {formatIDR(selectedDetailCard.buyPrice)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-emerald-500/30">
                    <span className="block text-[10px] text-emerald-700">Target Jual</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                      {formatIDR(selectedDetailCard.targetPrice)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-amber-500/30">
                    <span className="block text-[10px] text-amber-800">Est. Profit</span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-800">
                      +{formatIDR(selectedDetailCard.targetPrice - selectedDetailCard.buyPrice)}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      generatePromoCaption(selectedDetailCard),
                      'Caption jualan WA/IG berhasil disalin!'
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Salin Caption Jualan</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    const c = selectedDetailCard;
                    setSelectedDetailCard(null);
                    handleOpenEditCard(e, c);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                  <span>Edit Kartu</span>
                </button>
              </div>

              {selectedDetailCard.status === 'IN_STOCK' && (
                <button
                  type="button"
                  onClick={() => {
                    setPosSelectedCardId(selectedDetailCard.id);
                    setPosDealPrice(formatDotInput(selectedDetailCard.targetPrice));
                    setSelectedDetailCard(null);
                    setActiveTab('pos');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Jual di Kasir POS</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: ADD / EDIT TCG CARD ==================== */}
      {isCardModalOpen && (
        <div
          onClick={() => setIsCardModalOpen(false)}
          className="cx-modal fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <form
            onSubmit={handleSaveCard}
            onClick={(e) => e.stopPropagation()}
            className="cx-card-form w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-xl p-4 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {editingCard ? 'Edit Data Kartu TCG' : 'Tambah Kartu Baru ke Inventory'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Seri Permainan Kartu (TCG)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TCG_GAMES.map((game) => {
                    const active = cardForm.tcg === game.id;
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => setCardForm({ ...cardForm, tcg: game.id })}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition ${
                          active
                            ? game.id === 'ONE_PIECE'
                              ? 'bg-rose-500/20 border-rose-400 text-rose-700'
                              : 'bg-emerald-500/20 border-emerald-400 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-700'
                        }`}
                      >
                        {game.label} TCG
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kartu *
                </label>
                <input
                  type="text"
                  required
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  placeholder={
                    cardForm.tcg === 'ONE_PIECE'
                      ? 'Contoh: Monkey D. Luffy Manga Rare / Nami SP'
                      : 'Contoh: Charizard ex SAR / Umbreon VMAX Alt Art'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <details className="cx-extra sm:col-span-2" open={editingCard ? true : undefined}><summary>Detail kartu & penyimpanan</summary><div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Set / Ekspansi <span className="text-slate-500 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={cardForm.setName}
                  onChange={(e) => setCardForm({ ...cardForm, setName: e.target.value })}
                  placeholder={
                    cardForm.tcg === 'ONE_PIECE'
                      ? 'Contoh: Awakening of the New Era (OP-05)'
                      : 'Contoh: Shiny Treasure ex (sv4a)'
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kartu</label>
                <input
                  type="text"
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                  placeholder={cardForm.tcg === 'ONE_PIECE' ? 'Contoh: OP05-119' : 'Contoh: 349/190'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bahasa Kartu</label>
                <select
                  value={cardForm.language}
                  onChange={(e) => setCardForm({ ...cardForm, language: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                >
                  {POKEMON_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.code} - {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Kategori</label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowInlineCategoryInput((v) => !v)}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      + Tambah Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Kelola
                    </button>
                  </div>
                </div>
                {showInlineCategoryInput ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={inlineCategoryName}
                      onChange={(e) => setInlineCategoryName(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const created = await handleAddCategory(inlineCategoryName);
                          if (created) {
                            setCardForm({ ...cardForm, category: created, gradingCompany: created === 'Graded Slab' ? 'PSA' : 'Raw', grade: created === 'Graded Slab' ? 'PSA 10' : 'Raw NM/M' });
                            setInlineCategoryName('');
                            setShowInlineCategoryInput(false);
                          }
                        }
                      }}
                      placeholder="Nama kategori baru..."
                      className="flex-1 px-2.5 py-2 rounded-xl bg-slate-50 border border-emerald-500 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const created = await handleAddCategory(inlineCategoryName);
                        if (created) {
                          setCardForm({ ...cardForm, category: created, gradingCompany: created === 'Graded Slab' ? 'PSA' : 'Raw', grade: created === 'Graded Slab' ? 'PSA 10' : 'Raw NM/M' });
                          setInlineCategoryName('');
                          setShowInlineCategoryInput(false);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-extrabold"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select
                    value={cardForm.category}
                    onChange={(e) => setCardForm({ ...cardForm, category: e.target.value, gradingCompany: e.target.value === 'Graded Slab' ? 'PSA' : 'Raw', grade: e.target.value === 'Graded Slab' ? 'PSA 10' : 'Raw NM/M' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {cardForm.category === 'Graded Slab' && <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Grading / Raw
                </label>
                <select
                  value={cardForm.gradingCompany === 'Raw' ? 'PSA' : cardForm.gradingCompany}
                  onChange={(e) => {
                    const co = e.target.value;
                    setCardForm({
                      ...cardForm,
                      gradingCompany: co,
                      grade: co === 'Raw' ? 'Raw NM/M' : `${co} 10`
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                >
                  {GRADING_COMPANIES.filter(g => g !== 'Raw').map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skor Grade / Kondisi Spesifik
                </label>
                <input
                  type="text"
                  value={cardForm.grade}
                  onChange={(e) => setCardForm({ ...cardForm, grade: e.target.value })}
                  placeholder="Misal: PSA 10, BGS 9.5, atau Raw NM/M"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
              </div>

              </>}
              {cardForm.category === 'Single Card' && <div><label className="block text-xs font-bold text-slate-700 mb-1">Kondisi kartu (Raw)</label><select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" value={['Raw NM/M','Raw LP','Raw MP','Raw HP','Raw DMG'].includes(cardForm.grade) ? cardForm.grade : 'Raw NM/M'} onChange={e=>setCardForm({...cardForm,gradingCompany:'Raw',grade:e.target.value})}>{['Raw NM/M','Raw LP','Raw MP','Raw HP','Raw DMG'].map(g=><option key={g}>{g}</option>)}</select></div>}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Penyimpanan Fisik</label>
                <select value={cardForm.storageLocation} onChange={e=>setCardForm({...cardForm,storageLocation:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                  {storageLocations.map(loc=><option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              </div></details>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Harga Modal Kartu / HPP (IDR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={cardForm.buyPrice}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, buyPrice: formatDotInput(e.target.value) })
                    }
                    placeholder="2.500.000"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Harga Jual (IDR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500/80">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={cardForm.targetPrice}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, targetPrice: formatDotInput(e.target.value) })
                    }
                    placeholder="3.250.000"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-emerald-700 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-700">Foto Kartu TCG</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Foto Langsung</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleImageFileUpload(e, 'CARD_FORM')}
                    className="hidden"
                  />
                </label>

                <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-800" />
                  <span>Upload File / Galeri</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, 'CARD_FORM')}
                    className="hidden"
                  />
                </label>

                {cardForm.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setCardForm({ ...cardForm, imageUrl: '' })}
                    className="px-2.5 py-2 rounded-xl bg-rose-500/15 text-rose-700 text-xs font-bold"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>

              <input
                type="text"
                value={cardForm.imageUrl}
                onChange={(e) => setCardForm({ ...cardForm, imageUrl: e.target.value })}
                placeholder="Atau tempel URL gambar kartu (https://...)..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
              />

              {cardForm.imageUrl && (
                <div className="h-32 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                  <img
                    src={cardForm.imageUrl}
                    alt="Preview"
                    className="h-full object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="cx-form-footer flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold"
              >
                {editingCard ? 'Simpan Perubahan' : 'Simpan ke Inventory'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL 3: MANAGE STORAGE LOCATIONS ==================== */}
      {isStorageModalOpen && (
        <div
          onClick={() => setIsStorageModalOpen(false)}
          className="cx-modal fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-emerald-700" />
                <span>Lokasi Penyimpanan Fisik</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsStorageModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newStorageInput}
                onChange={(e) => setNewStorageInput(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (await handleAddStorageLocation(newStorageInput)) setNewStorageInput('');
                  }
                }}
                placeholder="Nama binder / brankas baru..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={async () => {
                  if (await handleAddStorageLocation(newStorageInput)) setNewStorageInput('');
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-extrabold"
              >
                Tambah
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {storageLocations.map((loc) => {
                const count = cards.filter(
                  (c) => c.status === 'IN_STOCK' && c.storageLocation === loc
                ).length;
                return (
                  <div
                    key={loc}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-700">{loc}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({count} kartu aktif)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStorageLocation(loc)}
                      className="p-1 text-slate-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: MANAGE CATEGORIES ==================== */}
      {isCategoryModalOpen && (
        <div
          onClick={() => setIsCategoryModalOpen(false)}
          className="cx-modal fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tags className="w-4 h-4 text-amber-800" />
                <span>Kategori Produk TCG</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (await handleAddCategory(newCategoryInput)) setNewCategoryInput('');
                  }
                }}
                placeholder="Nama kategori baru..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={async () => {
                  if (await handleAddCategory(newCategoryInput)) setNewCategoryInput('');
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                Tambah
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {categories.map((cat) => {
                const count = cards.filter(
                  (c) => c.status === 'IN_STOCK' && c.category === cat
                ).length;
                return (
                  <div
                    key={cat}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-700">{cat}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({count} kartu aktif)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="p-1 text-slate-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}