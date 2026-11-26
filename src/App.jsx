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
  Target,
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
  { id: 'POKEMON', label: 'Pokémon', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { id: 'ONE_PIECE', label: 'One Piece', badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
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

const extractCleanCardName = (rawName) => {
  if (!rawName) return '';
  return rawName
    .replace(/\([^)]*\)/g, ' ')
    .replace(
      /\b(ex|gx|vmax|vstar|v-union|v|sar|sr|ur|ar|chr|csr|ssr|hr|rrr|rr|sec|sp|tr|r|uc|c|l|leader|manga\s*rare|manga|alt\s*art|parallel|special\s*art\s*rare|full\s*art|secret\s*rare|promo|holo|reverse)\b/gi,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
};

const buildMarketSearchQuery = (card, { includeGrade = true } = {}) => {
  const cleanName = extractCleanCardName(card?.name || '');
  const number = (card?.number || '').trim();
  const baseQuery = [cleanName || card?.name || '', number].filter(Boolean).join(' ').trim();

  if (!includeGrade) return baseQuery;

  const company = card?.gradingCompany || getGradingCompany(card?.grade);
  const gradeText = (card?.grade || '').trim();
  if (company === 'Raw' || gradeText.toLowerCase().startsWith('raw')) {
    return baseQuery;
  }
  return [baseQuery, gradeText].filter(Boolean).join(' ').trim();
};

const getMarketAppLinks = (card) => {
  const webQuery = buildMarketSearchQuery(card, { includeGrade: true });
  const appQuery = buildMarketSearchQuery(card, { includeGrade: false });
  const encodedWeb = encodeURIComponent(webQuery);
  const encodedApp = encodeURIComponent(appQuery);

  return {
    webQuery,
    appQuery,
    pricecharting: {
      webUrl: `https://www.pricecharting.com/search-products?q=${encodedWeb}&type=prices`,
      androidIntent: `intent://www.pricecharting.com/search-products?q=${encodedApp}&type=prices#Intent;scheme=https;package=com.pricecharting.app;S.browser_fallback_url=${encodeURIComponent(
        `https://www.pricecharting.com/search-products?q=${encodedWeb}&type=prices`
      )};end`,
      iosScheme: `pricecharting://search?q=${encodedApp}`
    },
    ebay: {
      webUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodedWeb}&LH_Sold=1&LH_Complete=1`,
      androidIntent: `intent://www.ebay.com/sch/i.html?_nkw=${encodedApp}&LH_Sold=1&LH_Complete=1#Intent;scheme=https;package=com.ebay.mobile;S.browser_fallback_url=${encodeURIComponent(
        `https://www.ebay.com/sch/i.html?_nkw=${encodedWeb}&LH_Sold=1&LH_Complete=1`
      )};end`,
      iosScheme: `ebay://sch/i.html?_nkw=${encodedApp}&LH_Sold=1&LH_Complete=1`
    },
    snkrdunk: {
      webUrl: `https://snkrdunk.com/en/search/result?keyword=${encodedWeb}`,
      androidIntent: `intent://snkrdunk.com/en/search/result?keyword=${encodedApp}#Intent;scheme=https;package=jp.co.soda.snkrdunk;S.browser_fallback_url=${encodeURIComponent(
        `https://snkrdunk.com/en/search/result?keyword=${encodedWeb}`
      )};end`,
      iosScheme: `snkrdunk://search?keyword=${encodedApp}`
    },
    collectr: {
      webUrl: `https://app.getcollectr.com/?query=${encodedWeb}`,
      androidIntent: `intent://app.getcollectr.com/?query=${encodedApp}#Intent;scheme=https;package=com.collectr.app;S.browser_fallback_url=${encodeURIComponent(
        `https://app.getcollectr.com/?query=${encodedWeb}`
      )};end`,
      iosScheme: `collectr://search?query=${encodedApp}`
    }
  };
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
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Master Data: Categories & Storage Locations
  const [categories, setCategories] = useState(['Single Card', 'Graded Slab', 'Sealed Box', 'Booster Pack']);
  const [storageLocations, setStorageLocations] = useState([
    'Binder 1 - High End',
    'Binder 2 - AR / SR',
    'Brankas Slab Utama',
    'Rak Sealed Box'
  ]);

  // Inventory Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTcg, setFilterTcg] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterLanguage, setFilterLanguage] = useState('ALL');
  const [filterGrading, setFilterGrading] = useState('ALL');
  const [filterStorage, setFilterStorage] = useState('ALL');

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

  // Monthly Profit Goal State
  const [monthlyProfitGoal, setMonthlyProfitGoal] = useState(10000000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInputDraft, setGoalInputDraft] = useState('10.000.000');

  // Batch Market Scan State
  const [isBatchScanning, setIsBatchScanning] = useState(false);

  // Modals & Market Intel State
  const [selectedDetailCard, setSelectedDetailCard] = useState(null);
  const [marketCache, setMarketCache] = useState({});
  const [marketLoadingId, setMarketLoadingId] = useState(null);

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
  const api = async (path, method = 'GET', body) => {
    const base = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
    if (!base) throw new Error('VITE_API_URL belum dikonfigurasi');
    const response = await fetch(base + path, { method, ...(body === undefined ? {} : {headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)}), cache: 'no-store' });
    if (!response.ok) throw new Error(`API ${response.status}: ${path}`);
    return response.json();
  };
  const loadData = async () => {
    setConnection('loading');
    try {
      const [loadedCards, loadedTransactions] = await Promise.all([api('/cards'), api('/transactions')]);
      if (!Array.isArray(loadedCards) || !Array.isArray(loadedTransactions)) throw new Error('Format respons API tidak valid');
      setCards(loadedCards); setTransactions(loadedTransactions);
      setCategories(prev => [...new Set([...prev, ...loadedCards.map(c => c.category).filter(Boolean)])]);
      setStorageLocations(prev => [...new Set([...prev, ...loadedCards.map(c => c.storageLocation).filter(Boolean)])]);
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

    const sellRecommendations = inStock
      .map((card) => {
        const cached = marketCache[card.id];
        const buy = Number(card.buyPrice) || 0;
        const target = Number(card.targetPrice) || 0;
        const marginPct = buy > 0 ? Math.round(((target - buy) / buy) * 100) : 0;

        const verdictText = (cached?.verdict || '').toLowerCase();
        const hasLiveDropSignal =
          verdictText.includes('turun') ||
          verdictText.includes('koreksi') ||
          verdictText.includes('di bawah') ||
          verdictText.includes('lebih rendah');

        const hasLiveSurgeSignal =
          verdictText.includes('naik') ||
          verdictText.includes('melonjak') ||
          verdictText.includes('di atas') ||
          verdictText.includes('menguat');

        let trendDropPct = 0;
        let reason = '';
        let urgency = 'WATCH';

        if (hasLiveDropSignal) {
          trendDropPct = -12;
          reason = 'Data pasar terbaru menunjukkan harga listing kompetitor mulai terkoreksi di bawah target.';
          urgency = 'HIGH';
        } else if (hasLiveSurgeSignal) {
          trendDropPct = 14;
          reason = 'Permintaan pasar sedang menguat! Anda berpeluang menaikkan harga target jual.';
          urgency = 'SURGE';
        } else if (marginPct <= 22) {
          trendDropPct = -8;
          reason = `Spread margin tipis (+${marginPct}%). Segera lepas agar modal cepat berputar sebelum pasar melemah.`;
          urgency = 'HIGH';
        } else if (card.id === 'CRD-104' || card.id === 'CRD-105') {
          trendDropPct = -6;
          reason = 'Set terbaru (sv8 / OP-08) rawan koreksi pasca-rilis; amankan profit sebelum suplai bertambah.';
          urgency = 'MEDIUM';
        } else {
          trendDropPct = 4;
          reason = `Harga relatif stabil dengan proyeksi margin sehat (+${marginPct}%).`;
          urgency = 'WATCH';
        }

        const suggestedFastSellPrice =
          urgency === 'SURGE'
            ? Math.round((target * 1.1) / 10000) * 10000
            : Math.round((buy + (target - buy) * 0.65) / 10000) * 10000;

        return {
          card,
          marginPct,
          trendDropPct,
          reason,
          urgency,
          suggestedFastSellPrice,
          hasLiveCache: Boolean(cached)
        };
      })
      .filter((item) => item.urgency === 'HIGH' || item.urgency === 'MEDIUM' || item.urgency === 'SURGE')
      .sort((a, b) => a.trendDropPct - b.trendDropPct);

    const goalProgressPct =
      monthlyProfitGoal > 0
        ? Math.min(100, Math.max(0, Math.round((totalNetProfit / monthlyProfitGoal) * 100)))
        : 0;

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
      categoryStats,
      sellRecommendations,
      goalProgressPct
    };
  }, [cards, transactions, categories, marketCache, monthlyProfitGoal]);

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

  // --- MOBILE DEEP LINK / WEB LAUNCHER ---
  const handleOpenMarketApp = (e, platform, card) => {
    const links = getMarketAppLinks(card);
    const target = links[platform];
    if (!target) return;

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (isAndroid || isIOS) {
      e.preventDefault();
      copyToClipboard(
        links.appQuery,
        `Kata kunci "${links.appQuery}" disalin — membuka ${platform.toUpperCase()}...`
      );
      if (isAndroid) {
        window.location.href = target.androidIntent;
      } else {
        window.location.href = target.iosScheme;
        setTimeout(() => {
          window.open(target.webUrl, '_blank', 'noopener,noreferrer');
        }, 900);
      }
    }
  };

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
      storageLocation: storageLocations[0] || 'Binder 1 - High End',
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
    if (!cardForm.name.trim()) {
      showToast('Nama kartu wajib diisi.', 'error');
      return;
    }

    const payload = {
      tcg: cardForm.tcg || 'POKEMON',
      name: cardForm.name.trim(),
      setName: cardForm.setName.trim(),
      number: cardForm.number.trim() || '-',
      language: cardForm.language,
      category: cardForm.category,
      gradingCompany: cardForm.gradingCompany,
      grade: cardForm.grade.trim() || (cardForm.gradingCompany === 'Raw' ? 'Raw NM/M' : `${cardForm.gradingCompany} 10`),
      storageLocation: cardForm.storageLocation,
      buyPrice: parseDotNumber(cardForm.buyPrice),
      targetPrice: parseDotNumber(cardForm.targetPrice),
      imageUrl: cardForm.imageUrl.trim()
    };

    const ok = await persist(async () => {
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
        const incoming = newCardsFromTrade.map(({id, ...card}) => card);
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
  const handleAddCategory = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const exists = categories.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) return exists;
    setCategories((prev) => [...prev, trimmed]);
    showToast(`Kategori "${trimmed}" ditambahkan.`);
    return trimmed;
  };

  const handleRemoveCategory = (name) => {
    if (categories.length <= 1) {
      showToast('Minimal harus tersisa 1 kategori.', 'error');
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== name));
    if (filterCategory === name) setFilterCategory('ALL');
    showToast(`Kategori "${name}" dihapus.`);
  };

  const handleAddStorageLocation = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const exists = storageLocations.find((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (exists) return exists;
    setStorageLocations((prev) => [...prev, trimmed]);
    showToast(`Lokasi penyimpanan "${trimmed}" ditambahkan.`);
    return trimmed;
  };

  const handleRemoveStorageLocation = (name) => {
    if (storageLocations.length <= 1) {
      showToast('Minimal harus tersisa 1 lokasi penyimpanan.', 'error');
      return;
    }
    setStorageLocations((prev) => prev.filter((s) => s !== name));
    if (filterStorage === name) setFilterStorage('ALL');
    showToast(`Lokasi "${name}" dihapus.`);
  };

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
      const rows = filteredTransactions.map((t) => [
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

      const totalOmzetFiltered = filteredTransactions.reduce((sum, t) => sum + (Number(t.revenue) || 0), 0);
      const totalModalFiltered = filteredTransactions.reduce((sum, t) => sum + (Number(t.costBasis) || 0), 0);
      const totalProfitFiltered = filteredTransactions.reduce((sum, t) => sum + (Number(t.netProfit) || 0), 0);

      const monthSuffix = historyMonthFilter !== 'ALL' ? `_${historyMonthFilter}` : '';
      const periodLabel =
        historyMonthFilter !== 'ALL' ? ` - ${formatMonthLabel(historyMonthFilter)}` : ' - Semua Bulan';

      downloadExcelHtmlSheet({
        filename: `CARDEXX_Riwayat_Laba${monthSuffix}_${new Date().toISOString().slice(0, 10)}.xls`,
        sheetTitle: `CARDEXX Riwayat Transaksi & Laba${periodLabel}`,
        headers,
        rows,
        totalsRow: [
          'TOTAL',
          `${filteredTransactions.length} Trx`,
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
      const rows = filteredCards.map((c) => {
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

      const totalBuy = filteredCards.reduce((sum, c) => sum + (Number(c.buyPrice) || 0), 0);
      const totalTarget = filteredCards.reduce((sum, c) => sum + (Number(c.targetPrice) || 0), 0);
      const totalEstProfit = totalTarget - totalBuy;

      downloadExcelHtmlSheet({
        filename: `CARDEXX_Inventory_Stok_${new Date().toISOString().slice(0, 10)}.xls`,
        sheetTitle: `CARDEXX Inventory Stok Aktif (${filteredCards.length} Kartu)`,
        headers,
        rows,
        totalsRow: [
          'TOTAL',
          '',
          `${filteredCards.length} Kartu`,
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
  const handleImageFileUpload = (e, targetMode = 'CARD_FORM', tradeTempId = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 4MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      if (targetMode === 'CARD_FORM') {
        setCardForm((prev) => ({ ...prev, imageUrl: base64 }));
        showToast('Foto kartu berhasil dimuat!');
      } else if (targetMode === 'TRADE_IN' && tradeTempId) {
        setTradeInItems((prev) =>
          prev.map((row) => (row.tempId === tradeTempId ? { ...row, imageUrl: base64 } : row))
        );
        showToast('Foto kartu masuk berhasil dimuat!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // --- REAL-TIME MARKET INTELLIGENCE (eBay Last Sold, PriceCharting, SNKRDUNK, Collectr) ---
  const fetchMarketIntelligence = async (card, forceRefresh = false) => {
    if (!card) return;
    if (!forceRefresh && marketCache[card.id]) return;

    setMarketLoadingId(card.id);
    try {
      const searchSpec = buildMarketSearchQuery(card, { includeGrade: true });
      const tcgName = card.tcg === 'ONE_PIECE' ? 'One Piece Card Game' : 'Pokémon TCG';
      const setContext = card.setName ? `Set: ${card.setName}, ` : '';
      const prompt = `Cari harga pasar aktual terkini untuk kartu ${tcgName}: "${searchSpec}" (${setContext}Bahasa: ${getLanguageLabel(card.language)}).
Berikan ringkasan harga nyata dari 4 platform berikut jika ditemukan di hasil pencarian web:
1. eBay Last Sold (transaksi terjual terbaru)
2. PriceCharting
3. SNKRDUNK
4. Collectr

Kembalikan HANYA format JSON valid tanpa markdown dengan struktur:
{
  "ebaySold": { "range": "contoh: $180 - $210 (Rp 2,9jt - 3,4jt)", "note": "ringkasan singkat" },
  "priceCharting": { "range": "contoh: $195.00 (Rp 3,1jt)", "note": "ringkasan singkat" },
  "snkrdunk": { "range": "contoh: ¥28,500 (Rp 3,0jt)", "note": "ringkasan singkat" },
  "collectr": { "range": "contoh: $192.50 (Rp 3,1jt)", "note": "ringkasan singkat" },
  "verdict": "1-2 kalimat analisis posisi harga jual toko (${formatIDR(card.targetPrice)}) dibanding harga pasar saat ini."
}`;

      const apiKey = '';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const groundingChunks = data?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .filter((c) => c.web?.uri)
        .slice(0, 4)
        .map((c) => ({ title: c.web.title || 'Referensi Web', uri: c.web.uri }));

      const cleanedJson = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      setMarketCache((prev) => ({
        ...prev,
        [card.id]: {
          ...parsed,
          sources,
          updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      }));
    } catch (err) {
      console.error('Market lookup error:', err);
      setMarketCache((prev) => ({
        ...prev,
        [card.id]: {
          ebaySold: { range: 'Cek langsung via tombol eBay', note: 'Data live membutuhkan koneksi API aktif' },
          priceCharting: { range: 'Cek langsung via PriceCharting', note: 'Gunakan tombol buka link di atas' },
          snkrdunk: { range: 'Cek langsung via SNKRDUNK', note: 'Referensi pasar Jepang & Asia' },
          collectr: { range: 'Cek langsung via Collectr', note: 'Referensi portofolio kolektor' },
          verdict: `Gunakan 4 tombol cepat di atas untuk mengecek listing real-time "${buildMarketSearchQuery(card, { includeGrade: true })}" langsung di masing-masing platform.`,
          sources: [],
          updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      }));
    } finally {
      setMarketLoadingId(null);
    }
  };

  const openCardDetailWithMarketIntel = (card) => {
    setSelectedDetailCard(card);
    fetchMarketIntelligence(card, false);
  };

  // --- BATCH SCAN ALL ACTIVE INVENTORY MARKET INTEL ---
  const handleScanAllMarket = async () => {
    if (isBatchScanning || availableInventory.length === 0) return;
    setIsBatchScanning(true);
    showToast(`Memindai harga pasar ${availableInventory.length} kartu aktif...`);
    try {
      for (const card of availableInventory) {
        await fetchMarketIntelligence(card, true);
      }
      showToast('Pemindaian pasar seluruh kartu selesai!');
    } finally {
      setIsBatchScanning(false);
    }
  };

  if (connection !== 'ready') return <div className="min-h-screen bg-slate-950 text-slate-100 p-8"><h1 className="text-xl font-bold text-emerald-300">CARDEXX</h1><p className="my-4">{connection === 'loading' ? 'Memuat data dari database...' : 'Koneksi database gagal: ' + connectionError}</p>{connection === 'error' && <button className="bg-emerald-600 rounded px-4 py-2" onClick={loadData}>Coba lagi</button>}</div>;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      {saving && <div className="fixed inset-0 z-[100] bg-slate-950/60 flex items-center justify-center" role="status"><span className="bg-slate-900 p-4 rounded-xl">Menyimpan ke database...</span></div>}
      {/* Ambient Emerald & Gold Sky Vault Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[90] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md text-xs sm:text-sm font-bold transition-all ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-slate-900/95 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-amber-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <RayquazaLogo className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                  CARDEXX
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  MULTI-TCG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Pokémon & One Piece TCG Inventory, POS Kasir & Trade-In
              </p>
            </div>
          </div>

          {/* Quick Master Data & Add Card Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
              title="Kelola Kategori Kartu"
            >
              <Tags className="w-3.5 h-3.5 text-amber-400" />
              <span>Kategori</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStorageModalOpen(true)}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
              title="Kelola Lokasi Penyimpanan Fisik"
            >
              <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Penyimpanan</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddCard}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Kartu</span>
            </button>
          </div>
        </div>

        {/* Navigation Pill Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-2.5 overflow-x-auto">
          <nav className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800/90 min-w-max">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'inventory', label: `Inventory (${analytics.inStockCount})`, icon: Package },
              { id: 'sold', label: `Sold (${analytics.soldCount})`, icon: Archive },
              { id: 'pos', label: 'Kasir / Jual', icon: ShoppingBag },
              { id: 'trade', label: 'Tukar Tambah', icon: ArrowLeftRight },
              { id: 'history', label: 'Riwayat & Laba', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-5">
        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* 4 Compact KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500" />
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Modal Tertahan</span>
                  <Wallet className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-base sm:text-lg font-black text-white">{formatIDR(analytics.totalModalStok)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{analytics.inStockCount} kartu aktif</p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Estimasi Nilai Stok</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-base sm:text-lg font-black text-amber-300">{formatIDR(analytics.totalEstimasiJual)}</p>
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  Potensi +{formatIDR(analytics.potensiProfitStok)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500" />
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Omzet Terealisasi</span>
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                </div>
                <p className="text-base sm:text-lg font-black text-white">{formatIDR(analytics.totalOmzet)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{transactions.length} transaksi tercatat</p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-400 to-lime-400" />
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Laba Bersih Aktual</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p
                  className={`text-base sm:text-lg font-black ${
                    analytics.totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {analytics.totalNetProfit >= 0 ? '+' : ''}
                  {formatIDR(analytics.totalNetProfit)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Selisih harga laku - modal</p>
              </div>
            </div>

            {/* MONTHLY PROFIT GOAL TRACKER */}
            <div className="rounded-2xl bg-slate-900/85 border border-emerald-500/25 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Target Profit Bulanan (Monthly Goal Tracker)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Tercapai{' '}
                      <span className="text-emerald-300 font-bold">
                        {formatIDR(Math.max(0, analytics.totalNetProfit))}
                      </span>{' '}
                      dari target{' '}
                      <span className="text-amber-300 font-bold">{formatIDR(monthlyProfitGoal)}</span>
                    </p>
                  </div>
                </div>

                {isEditingGoal ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={goalInputDraft}
                      onChange={(e) => setGoalInputDraft(formatDotInput(e.target.value))}
                      className="w-32 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-emerald-500 text-xs font-extrabold text-amber-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseDotNumber(goalInputDraft);
                        if (parsed > 0) {
                          setMonthlyProfitGoal(parsed);
                          showToast(`Target profit bulanan diubah menjadi ${formatIDR(parsed)}`);
                        }
                        setIsEditingGoal(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-300">
                      {analytics.goalProgressPct}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setGoalInputDraft(formatDotInput(monthlyProfitGoal));
                        setIsEditingGoal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>Ubah Target</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-500"
                  style={{ width: `${analytics.goalProgressPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Start: Rp 0</span>
                <span>
                  {analytics.totalNetProfit >= monthlyProfitGoal
                    ? 'Target bulan ini sudah terlampaui!'
                    : `Kurang ${formatIDR(monthlyProfitGoal - Math.max(0, analytics.totalNetProfit))} lagi menuju target`}
                </span>
              </div>
            </div>

            {/* BUSINESS FINANCIAL FLOWCHART */}
            <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Flowchart Arus Keuangan & Perputaran Modal Bisnis</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Alur perputaran modal dari belanja stok hingga realisasi kas & laba bersih
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold text-emerald-300">
                  ROI Stok Aktif:{' '}
                  {analytics.totalModalStok > 0
                    ? Math.round((analytics.potensiProfitStok / analytics.totalModalStok) * 100)
                    : 0}
                  %
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-11 gap-2 items-center pt-1">
                <div className="lg:col-span-2 p-3 rounded-2xl bg-slate-950 border border-sky-500/35 relative">
                  <span className="text-[10px] font-extrabold uppercase text-sky-400 block">
                    1. Total Modal Masuk
                  </span>
                  <p className="text-sm font-black text-white mt-1">
                    {formatIDR(analytics.totalModalKeseluruhan)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Stok Aktif + Modal Terjual
                  </p>
                </div>

                <div className="hidden lg:flex lg:col-span-1 justify-center text-slate-600">
                  <ArrowRight className="w-5 h-5 text-emerald-500/70" />
                </div>

                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/35">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400 block">
                      2A. Aset di Brankas
                    </span>
                    <p className="text-xs sm:text-sm font-black text-amber-200 mt-1">
                      {formatIDR(analytics.totalModalStok)}
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Pokémon ({analytics.pokemonCount})</span>
                        <span className="text-slate-200 font-semibold">{formatIDR(analytics.pokemonModal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>One Piece ({analytics.onePieceCount})</span>
                        <span className="text-slate-200 font-semibold">{formatIDR(analytics.onePieceModal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-teal-500/35">
                    <span className="text-[10px] font-extrabold uppercase text-teal-400 block">
                      2B. Modal Terlikuidasi
                    </span>
                    <p className="text-xs sm:text-sm font-black text-teal-200 mt-1">
                      {formatIDR(analytics.totalCostSold)}
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Omzet Masuk</span>
                        <span className="text-emerald-300 font-semibold">{formatIDR(analytics.totalOmzet)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Item Terjual</span>
                        <span className="text-slate-200 font-semibold">{analytics.soldCount} kartu</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex lg:col-span-1 justify-center text-slate-600">
                  <ArrowRight className="w-5 h-5 text-emerald-500/70" />
                </div>

                <div className="lg:col-span-3 p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">
                    3. Kas Laba & Proyeksi
                  </span>
                  <p
                    className={`text-sm font-black ${
                      analytics.totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {analytics.totalNetProfit >= 0 ? '+' : ''}
                    {formatIDR(analytics.totalNetProfit)}
                  </p>
                  <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Est. Nilai Stok</span>
                      <span className="text-amber-300 font-semibold">
                        {formatIDR(analytics.totalEstimasiJual)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potensi Profit</span>
                      <span className="text-emerald-300 font-semibold">
                        +{formatIDR(analytics.potensiProfitStok)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Asset Distribution */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Distribusi Kategori Stok Aktif</span>
                </h3>
                <span className="text-[11px] text-slate-400">{analytics.inStockCount} Item</span>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {analytics.categoryStats.map((cat) => {
                  const pct =
                    analytics.totalModalStok > 0
                      ? Math.round((cat.modal / analytics.totalModalStok) * 100)
                      : 0;
                  return (
                    <div key={cat.name} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-200">
                          {cat.name} <span className="text-slate-500">({cat.count})</span>
                        </span>
                        <span className="font-extrabold text-emerald-300">{formatIDR(cat.modal)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFilterTcg('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      filterTcg === 'ALL'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Semua TCG ({analytics.inStockCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTcg('POKEMON')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      filterTcg === 'POKEMON'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    Pokémon ({analytics.pokemonCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTcg('ONE_PIECE')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      filterTcg === 'ONE_PIECE'
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    One Piece ({analytics.onePieceCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    Menampilkan <strong className="text-slate-200">{filteredCards.length}</strong> kartu aktif
                  </span>
                  <button
                    type="button"
                    onClick={handleExportInventoryExcel}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Excel (.xls)</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama kartu, set, nomor (mis. OP05-119 / 349/190), grade, atau binder..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
                    className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
                    className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
                    onChange={(e) => setFilterStorage(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
              <div className="rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 p-10 text-center">
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">Tidak ada kartu stok aktif yang cocok</p>
                <p className="text-xs text-slate-500 mt-1">
                  Coba ubah filter pencarian atau tambahkan kartu baru ke inventory.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {filteredCards.map((card) => {
                  const estProfit = card.targetPrice - card.buyPrice;
                  const marketLinks = getMarketAppLinks(card);
                  const gradingCo = card.gradingCompany || getGradingCompany(card.grade);
                  const tcgMeta = getTcgMeta(card.tcg);

                  return (
                    <div
                      key={card.id}
                      onClick={() => openCardDetailWithMarketIntel(card)}
                      className="group cursor-pointer rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all overflow-hidden flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="relative h-40 bg-slate-950 overflow-hidden border-b border-slate-800/80">
                          {card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.name}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-3">
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
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-950/90 border border-slate-700 text-[10px] font-extrabold text-amber-300">
                              {card.language}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                gradingCo === 'Raw'
                                  ? 'bg-slate-950/90 border-slate-700 text-slate-300'
                                  : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                              }`}
                            >
                              {card.grade}
                            </span>
                          </div>

                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditCard(e, card)}
                              className="p-1.5 rounded-lg bg-slate-950/90 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 border border-slate-700 transition"
                              title="Edit Kartu"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCard(e, card.id)}
                              className="p-1.5 rounded-lg bg-slate-950/90 hover:bg-rose-500 text-slate-200 hover:text-white border border-slate-700 transition"
                              title="Hapus Kartu"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 space-y-2">
                          <div>
                            <h3 className="text-xs sm:text-sm font-extrabold text-white line-clamp-1 group-hover:text-emerald-300 transition">
                              {card.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 truncate">
                              {card.setName ? (
                                <>
                                  {card.setName} •{' '}
                                  <span className="text-slate-300 font-semibold">{card.number}</span>
                                </>
                              ) : (
                                <span className="text-slate-300 font-semibold">No. {card.number}</span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/70 px-2 py-1 rounded-lg border border-slate-800/70">
                            <span className="truncate">{card.category}</span>
                            <span className="text-emerald-400 font-bold truncate max-w-[110px]">
                              {card.storageLocation}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                              <span className="block text-[10px] text-slate-500">Modal HPP</span>
                              <span className="text-xs font-bold text-slate-200">{formatIDR(card.buyPrice)}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                              <span className="block text-[10px] text-emerald-400/80">Target Jual</span>
                              <span className="text-xs font-extrabold text-emerald-300">
                                {formatIDR(card.targetPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 pb-3 pt-1 space-y-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          <a
                            href={marketLinks.pricecharting.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleOpenMarketApp(e, 'pricecharting', card)}
                            className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-sky-300 flex items-center justify-center gap-1 transition"
                          >
                            <span>PriceCharting</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <a
                            href={marketLinks.ebay.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleOpenMarketApp(e, 'ebay', card)}
                            className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 transition"
                          >
                            <span>eBay Sold</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <a
                            href={marketLinks.snkrdunk.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleOpenMarketApp(e, 'snkrdunk', card)}
                            className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-rose-300 flex items-center justify-center gap-1 transition"
                          >
                            <span>SNKRDUNK</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <a
                            href={marketLinks.collectr.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleOpenMarketApp(e, 'collectr', card)}
                            className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-emerald-300 flex items-center justify-center gap-1 transition"
                          >
                            <span>Collectr</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                          <span className="text-[10px] font-bold text-emerald-400">
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
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-extrabold transition"
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
            <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Archive className="w-4 h-4 text-amber-400" />
                    <span>Arsip Kartu Terjual ({soldCards.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Total Profit dari Kartu Terjual:{' '}
                    <span className="text-emerald-400 font-bold">
                      {formatIDR(
                        soldCards.reduce((sum, c) => sum + ((c.soldPrice || 0) - (c.buyPrice || 0)), 0)
                      )}
                    </span>
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={soldSearchQuery}
                    onChange={(e) => setSoldSearchQuery(e.target.value)}
                    placeholder="Cari arsip kartu sold..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSoldFilterTcg('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      soldFilterTcg === 'ALL'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Semua TCG ({cards.filter((c) => c.status === 'SOLD').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoldFilterTcg('POKEMON')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      soldFilterTcg === 'POKEMON'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    Pokémon ({cards.filter((c) => c.status === 'SOLD' && (c.tcg || 'POKEMON') === 'POKEMON').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoldFilterTcg('ONE_PIECE')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                      soldFilterTcg === 'ONE_PIECE'
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    One Piece ({cards.filter((c) => c.status === 'SOLD' && c.tcg === 'ONE_PIECE').length})
                  </button>
                </div>
              </div>
            </div>

            {soldCards.length === 0 ? (
              <div className="rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 p-10 text-center">
                <Archive className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">Belum ada kartu berstatus Sold untuk filter ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {soldCards.map((card) => {
                  const realizedProfit = (card.soldPrice || 0) - (card.buyPrice || 0);
                  const tcgMeta = getTcgMeta(card.tcg);
                  return (
                    <div
                      key={card.id}
                      onClick={() => openCardDetailWithMarketIntel(card)}
                      className="cursor-pointer rounded-2xl bg-slate-900/75 border border-slate-800 hover:border-amber-500/40 overflow-hidden transition"
                    >
                      <div className="relative h-36 bg-slate-950 border-b border-slate-800">
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-full object-contain p-2 opacity-85"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <RayquazaLogo className="w-10 h-10 opacity-40" />
                            <span className="text-[10px] font-bold text-slate-600 mt-1">
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
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-[10px] font-extrabold text-rose-300">
                            SOLD • {card.language}
                          </span>
                        </div>
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-slate-300">
                          {card.grade}
                        </span>
                      </div>

                      <div className="p-3 space-y-2">
                        <div>
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-200 truncate">{card.name}</h3>
                          <p className="text-[11px] text-slate-500 truncate">
                            {card.setName ? `${card.setName} • ${card.number}` : `No. ${card.number}`}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                            <span className="block text-[10px] text-slate-500">Modal</span>
                            <span className="font-bold text-slate-300">{formatIDR(card.buyPrice)}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-950 border border-amber-500/20">
                            <span className="block text-[10px] text-amber-400/80">Laku Di</span>
                            <span className="font-extrabold text-amber-300">{formatIDR(card.soldPrice)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                          <span className="text-slate-500">Profit Bersih</span>
                          <span
                            className={`font-extrabold ${
                              realizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/85 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>1. Pilih Kartu Terjual dari Stok</span>
                </h2>
                <span className="text-xs text-slate-400">{posFilteredInventory.length} stok tersedia</span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={posSearchQuery}
                  onChange={(e) => setPosSearchQuery(e.target.value)}
                  placeholder="Cari nama kartu, nomor, set, atau grade di kasir..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-white truncate">{card.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-amber-300">
                              {card.language}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-[10px] font-bold text-emerald-300">
                              {card.grade}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {card.setName ? `${card.setName} (${card.number})` : `No. ${card.number}`} • Modal: {formatIDR(card.buyPrice)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-emerald-300">
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
              className="lg:col-span-5 rounded-2xl bg-slate-900/85 border border-slate-800 p-4 space-y-4 h-fit"
            >
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>2. Input Harga Deal & Selesaikan</span>
              </h2>

              {selectedPosCard ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                  <p className="text-xs font-extrabold text-emerald-300">{selectedPosCard.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {selectedPosCard.setName ? `${selectedPosCard.setName} • ` : ''}
                    {selectedPosCard.number} • {selectedPosCard.grade}
                  </p>
                  <p className="text-[11px] text-slate-300 pt-1">
                    Modal Kartu (HPP): <span className="font-bold">{formatIDR(selectedPosCard.buyPrice)}</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-dashed border-slate-800 text-xs text-slate-500">
                  Klik salah satu kartu di sebelah kiri terlebih dahulu.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Laku Di Harga / Deal Price (IDR) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={posDealPrice}
                  onChange={(e) => setPosDealPrice(formatDotInput(e.target.value))}
                  placeholder="Contoh: 3.500.000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-extrabold text-amber-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Catatan Transaksi (Opsional)
                </label>
                <input
                  type="text"
                  value={posNotes}
                  onChange={(e) => setPosNotes(e.target.value)}
                  placeholder="Misal: COD Bandung / Transfer BCA"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Harga Laku</span>
                  <span className="font-bold text-white">{formatIDR(posCalculation.deal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Modal HPP</span>
                  <span className="font-bold text-slate-300">- {formatIDR(posCalculation.cost)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-200">Laba Bersih</span>
                  <span
                    className={`text-sm font-black ${
                      posCalculation.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 transition"
              >
                Konfirmasi Terjual & Masuk Arsip Sold
              </button>
            </form>
          </div>
        )}

        {/* ==================== TAB 5: TUKAR TAMBAH (TRADE-IN) ==================== */}
        {activeTab === 'trade' && (
          <form onSubmit={handleExecuteTradeIn} className="space-y-4">
            <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nominal Cash (IDR)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={tradeCashFlowType === 'EVEN'}
                  value={tradeCashFlowType === 'EVEN' ? '0' : tradeCashAmount}
                  onChange={(e) => setTradeCashAmount(formatDotInput(e.target.value))}
                  placeholder="Contoh: 1.500.000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-extrabold text-amber-300 disabled:opacity-40 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-rose-300">
                    Kartu Toko yang Keluar ({tradeOutCardIds.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Modal Keluar: {formatIDR(tradeSummary.totalOutCost)}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tradeOutSearch}
                    onChange={(e) => setTradeOutSearch(e.target.value)}
                    placeholder="Cari kartu stok toko yang keluar..."
                    className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                  {tradeOutSearch && (
                    <button
                      type="button"
                      onClick={() => setTradeOutSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {filteredTradeOutInventory.map((card) => {
                    const checked = tradeOutCardIds.includes(card.id);
                    return (
                      <div
                        key={card.id}
                        onClick={() => toggleTradeOutCard(card.id)}
                        className={`cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                          checked
                            ? 'bg-rose-950/35 border-rose-500/60'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {checked ? '✓ ' : ''}
                            {card.name} ({card.language} • {card.grade})
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {card.setName ? `${card.setName} • ${card.number}` : `No. ${card.number}`}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-300 shrink-0">
                          {formatIDR(card.buyPrice)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-emerald-300">
                    Kartu Masuk ke Inventory ({tradeInItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddTradeInRow}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Kartu Masuk</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {tradeInItems.map((item, idx) => (
                    <div
                      key={item.tempId}
                      className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-emerald-400">
                          Kartu Masuk #{idx + 1}
                        </span>
                        {tradeInItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTradeInRow(item.tempId)}
                            className="text-[11px] text-rose-400 hover:underline"
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
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
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
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
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
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
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
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
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
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
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
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
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
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
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
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
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
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-bold"
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
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">
                  Valuasi Kartu Masuk:{' '}
                  <span className="font-bold text-emerald-300">{formatIDR(tradeSummary.totalInValuation)}</span> •
                  Modal Kartu Keluar:{' '}
                  <span className="font-bold text-rose-300">{formatIDR(tradeSummary.totalOutCost)}</span>
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-white">
                  Dampak Laba Bersih Trade-In:{' '}
                  <span
                    className={
                      tradeSummary.tradeNetProfitImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-extrabold shrink-0 shadow-lg"
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
            <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap flex-1 items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Cari ID transaksi, nama kartu, tanggal, catatan..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="relative flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 pointer-events-none" />
                  <select
                    value={historyMonthFilter}
                    onChange={(e) => setHistoryMonthFilter(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-200 focus:outline-none focus:border-amber-400"
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
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="ALL">Semua TCG</option>
                  <option value="POKEMON">Pokémon</option>
                  <option value="ONE_PIECE">One Piece</option>
                  <option value="MIXED">Campuran (Trade)</option>
                </select>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
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
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-extrabold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportHistoryExcel}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Excel (.xls)</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/85 border border-slate-800 overflow-hidden">
              <div className="max-h-[460px] overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
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
                        <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-200 block">{trx.id}</span>
                            <span className="text-[10px] text-slate-500">{trx.date}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {trxTcg === 'ONE_PIECE' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                One Piece
                              </span>
                            ) : trxTcg === 'MIXED' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                PKM + OP
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Pokémon
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                trx.type === 'SALE'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-amber-500/15 text-amber-300'
                              }`}
                            >
                              {trx.type === 'SALE' ? 'PENJUALAN' : 'TUKAR TAMBAH'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-200">{trx.summary}</p>
                            {trx.notes && <p className="text-[10px] text-slate-500">{trx.notes}</p>}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-200 whitespace-nowrap">
                            {formatIDR(trx.revenue)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 whitespace-nowrap">
                            {formatIDR(trx.costBasis)}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-extrabold whitespace-nowrap ${
                              trx.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
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

      {/* ==================== MODAL 1: CARD DETAIL & LIVE MARKET INTEL ==================== */}
      {selectedDetailCard && (
        <div
          onClick={() => setSelectedDetailCard(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4"
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
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[11px] font-extrabold text-amber-300">
                    {selectedDetailCard.language} • {getLanguageLabel(selectedDetailCard.language)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-extrabold text-emerald-300">
                    {selectedDetailCard.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300">
                    {selectedDetailCard.storageLocation}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-white">{selectedDetailCard.name}</h2>
                <p className="text-xs text-slate-400">
                  {selectedDetailCard.setName ? `${selectedDetailCard.setName} • ` : ''}
                  Nomor: <span className="text-slate-200 font-bold">{selectedDetailCard.number}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailCard(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4 rounded-2xl bg-slate-950 border border-slate-800 h-52 flex items-center justify-center p-2">
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
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="block text-[10px] text-slate-500">Modal HPP</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      {formatIDR(selectedDetailCard.buyPrice)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30">
                    <span className="block text-[10px] text-emerald-400">Target Jual</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-300">
                      {formatIDR(selectedDetailCard.targetPrice)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30">
                    <span className="block text-[10px] text-amber-400">Est. Profit</span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-300">
                      +{formatIDR(selectedDetailCard.targetPrice - selectedDetailCard.buyPrice)}
                    </span>
                  </div>
                </div>

                {(() => {
                  const links = getMarketAppLinks(selectedDetailCard);
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <a
                        href={links.ebay.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleOpenMarketApp(e, 'ebay', selectedDetailCard)}
                        className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-extrabold text-amber-300 flex items-center justify-center gap-1.5"
                      >
                        <span>eBay Sold</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={links.pricecharting.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleOpenMarketApp(e, 'pricecharting', selectedDetailCard)}
                        className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-extrabold text-sky-300 flex items-center justify-center gap-1.5"
                      >
                        <span>PriceCharting</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={links.snkrdunk.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleOpenMarketApp(e, 'snkrdunk', selectedDetailCard)}
                        className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-extrabold text-rose-300 flex items-center justify-center gap-1.5"
                      >
                        <span>SNKRDUNK</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={links.collectr.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleOpenMarketApp(e, 'collectr', selectedDetailCard)}
                        className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-1.5"
                      >
                        <span>Collectr</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })()}

                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Intelijen Harga Pasar 4 Platform</span>
                    </span>
                    <button
                      type="button"
                      disabled={marketLoadingId === selectedDetailCard.id}
                      onClick={() => fetchMarketIntelligence(selectedDetailCard, true)}
                      className="text-[11px] font-bold text-slate-300 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          marketLoadingId === selectedDetailCard.id ? 'animate-spin text-emerald-400' : ''
                        }`}
                      />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {marketLoadingId === selectedDetailCard.id ? (
                    <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Mengambil data eBay Last Sold, PriceCharting, SNKRDUNK & Collectr...</span>
                    </div>
                  ) : marketCache[selectedDetailCard.id] ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-amber-400 block">eBay Last Sold</span>
                          <span className="font-extrabold text-white">
                            {marketCache[selectedDetailCard.id].ebaySold?.range}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {marketCache[selectedDetailCard.id].ebaySold?.note}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-sky-400 block">PriceCharting</span>
                          <span className="font-extrabold text-white">
                            {marketCache[selectedDetailCard.id].priceCharting?.range}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {marketCache[selectedDetailCard.id].priceCharting?.note}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-rose-400 block">SNKRDUNK</span>
                          <span className="font-extrabold text-white">
                            {marketCache[selectedDetailCard.id].snkrdunk?.range}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {marketCache[selectedDetailCard.id].snkrdunk?.note}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-emerald-400 block">Collectr</span>
                          <span className="font-extrabold text-white">
                            {marketCache[selectedDetailCard.id].collectr?.range}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {marketCache[selectedDetailCard.id].collectr?.note}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        {marketCache[selectedDetailCard.id].verdict}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      generatePromoCaption(selectedDetailCard),
                      'Caption jualan WA/IG berhasil disalin!'
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Salin Caption Jualan</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    const c = selectedDetailCard;
                    setSelectedDetailCard(null);
                    handleOpenEditCard(e, c);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
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
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <form
            onSubmit={handleSaveCard}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-white">
                {editingCard ? 'Edit Data Kartu TCG' : 'Tambah Kartu Baru ke Inventory'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                              ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                              : 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {game.label} TCG
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Kartu</label>
                <input
                  type="text"
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                  placeholder={cardForm.tcg === 'ONE_PIECE' ? 'Contoh: OP05-119' : 'Contoh: 349/190'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bahasa Kartu</label>
                <select
                  value={cardForm.language}
                  onChange={(e) => setCardForm({ ...cardForm, language: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white"
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
                  <label className="text-xs font-bold text-slate-300">Kategori</label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowInlineCategoryInput((v) => !v)}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      + Tambah Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-slate-400 hover:text-white"
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const created = handleAddCategory(inlineCategoryName);
                          if (created) {
                            setCardForm({ ...cardForm, category: created });
                            setInlineCategoryName('');
                            setShowInlineCategoryInput(false);
                          }
                        }
                      }}
                      placeholder="Nama kategori baru..."
                      className="flex-1 px-2.5 py-2 rounded-xl bg-slate-950 border border-emerald-500 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const created = handleAddCategory(inlineCategoryName);
                        if (created) {
                          setCardForm({ ...cardForm, category: created });
                          setInlineCategoryName('');
                          setShowInlineCategoryInput(false);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select
                    value={cardForm.category}
                    onChange={(e) => setCardForm({ ...cardForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Jenis Grading / Raw
                </label>
                <select
                  value={cardForm.gradingCompany}
                  onChange={(e) => {
                    const co = e.target.value;
                    setCardForm({
                      ...cardForm,
                      gradingCompany: co,
                      grade: co === 'Raw' ? 'Raw NM/M' : `${co} 10`
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white"
                >
                  {GRADING_COMPANIES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Skor Grade / Kondisi Spesifik
                </label>
                <input
                  type="text"
                  value={cardForm.grade}
                  onChange={(e) => setCardForm({ ...cardForm, grade: e.target.value })}
                  placeholder="Misal: PSA 10, BGS 9.5, atau Raw NM/M"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">Lokasi Penyimpanan Fisik</label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowInlineStorageInput((v) => !v)}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      + Tambah Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStorageModalOpen(true)}
                      className="text-slate-400 hover:text-white"
                    >
                      Kelola
                    </button>
                  </div>
                </div>
                {showInlineStorageInput ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={inlineStorageName}
                      onChange={(e) => setInlineStorageName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const created = handleAddStorageLocation(inlineStorageName);
                          if (created) {
                            setCardForm({ ...cardForm, storageLocation: created });
                            setInlineStorageName('');
                            setShowInlineStorageInput(false);
                          }
                        }
                      }}
                      placeholder="Contoh: Binder 3 - Ultra Rare"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const created = handleAddStorageLocation(inlineStorageName);
                        if (created) {
                          setCardForm({ ...cardForm, storageLocation: created });
                          setInlineStorageName('');
                          setShowInlineStorageInput(false);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select
                    value={cardForm.storageLocation}
                    onChange={(e) => setCardForm({ ...cardForm, storageLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white"
                  >
                    {storageLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-emerald-300 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-300">Foto Kartu TCG</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
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

                <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
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
                    className="px-2.5 py-2 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-bold"
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
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
              />

              {cardForm.imageUrl && (
                <div className="h-32 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
                  <img
                    src={cardForm.imageUrl}
                    alt="Preview"
                    className="h-full object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-extrabold"
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
          className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-emerald-400" />
                <span>Lokasi Penyimpanan Fisik</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsStorageModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newStorageInput}
                onChange={(e) => setNewStorageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (handleAddStorageLocation(newStorageInput)) setNewStorageInput('');
                  }
                }}
                placeholder="Nama binder / brankas baru..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddStorageLocation(newStorageInput)) setNewStorageInput('');
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
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
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{loc}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({count} kartu aktif)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStorageLocation(loc)}
                      className="p-1 text-slate-500 hover:text-rose-400"
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
          className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Tags className="w-4 h-4 text-amber-400" />
                <span>Kategori Produk TCG</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (handleAddCategory(newCategoryInput)) setNewCategoryInput('');
                  }
                }}
                placeholder="Nama kategori baru..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddCategory(newCategoryInput)) setNewCategoryInput('');
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
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{cat}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({count} kartu aktif)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="p-1 text-slate-500 hover:text-rose-400"
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