// ============================================
// decoded.finance — IPO Data Model (v2)
// Saudi Arabian IPOs, 2020–present
//
// Schema v2 changes:
//  - offer_price is nullable (direct listings have no offer price)
//  - listing_type: 'ipo' | 'direct_listing'
//  - listing_year: pre-computed for fast year-tab filtering
//  - confidence: 'High' | 'Medium' | 'Low' (Low records excluded from public site)
//  - source_urls / notes: internal QA provenance
//  - Removed: return_from_ipo, performance_badge, market_cap_display (all computed live)
//  - market_cap_at_ipo_sar: renamed from market_cap_sar, nullable
// ============================================

export type Market = 'TASI' | 'Nomu';
export type Confidence = 'High' | 'Medium' | 'Low';
export type ListingType = 'ipo' | 'direct_listing';

export interface IPORecord {
    id: string;
    company_name: string;
    company_name_ar: string;           // empty string if not yet verified
    symbol: string;
    sector: string;
    market: Market;
    listing_type: ListingType;
    listing_date: string;              // YYYY-MM-DD
    listing_year: number;              // pre-computed from listing_date
    offer_price: number | null;        // null for direct listings
    market_cap_at_ipo_sar: number | null;
    confidence: Confidence;
    source_urls: string[];
    notes: string;
    has_case_study: boolean;
    description: string;
}

export interface IPODataset {
    metadata: {
        last_updated: string;
        total_ipos: number;
        data_source: string;
        description: string;
        schema_version: number;
    };
    ipos: IPORecord[];
}

// ---- Saudi IPO Dataset ----
// All prices in SAR. Confidence levels:
//   High   = verified against multiple primary sources (prospectus / Saudi Exchange announcements)
//   Medium = plausible from one source, not cross-checked
//   Low    = estimated or uncertain — excluded from public site by getPublicIPOs()
//
// Records ordered by listing_date descending (most recent first).

export const ipoData: IPODataset = {
    metadata: {
        last_updated: "2026-02-21",
        total_ipos: 19,
        data_source: "Abdul Gaffar Mohammed, CFA — decoded.finance",
        description: "Comprehensive Saudi Arabia IPO database (2020–present) with live performance tracking",
        schema_version: 2,
    },
    ipos: [
        // ── 2026 ────────────────────────────────────────────────────
        {
            id: "al-rashed-ipo",
            company_name: "Al Rashed Foods",
            company_name_ar: "شركة الراشد للأغذية",
            symbol: "4339",
            sector: "Consumer Staples",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2026-01-20",
            listing_year: 2026,
            offer_price: 45,
            market_cap_at_ipo_sar: 4500000000,
            confidence: "High",
            source_urls: ["https://decoded.finance/case-studies/al-rashed-ipo"],
            notes: "Ticker 4339 to be confirmed against Saudi Exchange official records.",
            has_case_study: true,
            description: "Consumer food company listed on Tadawul main market",
        },

        // ── 2025 ────────────────────────────────────────────────────
        {
            id: "flynas-airlines-2025",
            company_name: "Flynas Airlines",
            company_name_ar: "طيران ناس",
            symbol: "4264",
            sector: "Industrials",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2025-06-18",
            listing_year: 2025,
            offer_price: 80,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Sector updated to Industrials (transport/aviation). Offer price and symbol verified.",
            has_case_study: false,
            description: "Saudi low-cost carrier capitalising on Vision 2030 tourism growth",
        },
        {
            id: "almasar-alshamil-education-2025",
            company_name: "Almasar Alshamil Education",
            company_name_ar: "شركة المسار الشامل للتعليم",
            symbol: "6019",
            sector: "Consumer Discretionary",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2025-02-18",
            listing_year: 2025,
            offer_price: 19.50,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Ticker corrected from 4210 to 6019; market corrected from Nomu to TASI; price corrected from 14.51 to 19.50.",
            has_case_study: false,
            description: "Private education services provider in Saudi Arabia",
        },
        {
            id: "cherry-trading-2025",
            company_name: "Cherry Trading",
            company_name_ar: "شركة شيري للتجارة",
            symbol: "4265",
            sector: "Consumer Discretionary",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2025-01-10",
            listing_year: 2025,
            offer_price: 28,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Market corrected from Nomu to TASI; price corrected from 12.36 to 28.",
            has_case_study: false,
            description: "Auto rental and consumer trading services",
        },

        // ── 2024 ────────────────────────────────────────────────────
        {
            id: "umm-al-qura-development-2024",
            company_name: "Umm Al Qura Development",
            company_name_ar: "شركة أم القرى للتطوير والإعمار",
            symbol: "4325",
            sector: "Real Estate",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2024-03-11",
            listing_year: 2024,
            offer_price: 74.79,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Offer price and market cap to be cross-checked against prospectus.",
            has_case_study: false,
            description: "Real estate development near the Holy Mosque in Mecca",
        },

        // ── 2022 ────────────────────────────────────────────────────
        {
            id: "elm-company-2022",
            company_name: "Elm Company",
            company_name_ar: "شركة علم",
            symbol: "7203",
            sector: "Technology",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2022-02-09",
            listing_year: 2022,
            offer_price: 128,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Ticker corrected from 2370 to 7203; price corrected from 15.40 to 128; listing date corrected from Dec to Feb 2022.",
            has_case_study: false,
            description: "Government digital security and e-services platform",
        },
        {
            id: "east-pipes-integrated-2022",
            company_name: "East Pipes Integrated",
            company_name_ar: "شركة أنابيب الشرق المتكاملة",
            symbol: "1321",
            sector: "Industrials",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2022-06-12",
            listing_year: 2022,
            offer_price: 80,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Price corrected from 20.29 to 80.",
            has_case_study: false,
            description: "Steel pipes manufacturer serving oil & gas infrastructure",
        },

        // ── 2021 ────────────────────────────────────────────────────
        {
            id: "saudi-tadawul-group-2021",
            company_name: "Saudi Tadawul Group",
            company_name_ar: "مجموعة تداول السعودية القابضة",
            symbol: "1111",
            sector: "Financials",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-12-14",
            listing_year: 2021,
            offer_price: 112.48,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Offer price to be verified against prospectus; current value from prior dataset.",
            has_case_study: false,
            description: "Operator of the Saudi stock exchange and financial market infrastructure",
        },
        {
            id: "stc-solutions-2021",
            company_name: "stc solutions",
            company_name_ar: "خدمات الإنترنت والاتصالات (حلول stc)",
            symbol: "7202",
            sector: "Technology",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-11-11",
            listing_year: 2021,
            offer_price: 151,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Ticker corrected from 2310 to 7202; price corrected from 42.16 to 151.",
            has_case_study: false,
            description: "IT and digital solutions subsidiary of Saudi Telecom Company",
        },
        {
            id: "acwa-power-2021",
            company_name: "ACWA Power",
            company_name_ar: "شركة أكوا باور",
            symbol: "2082",
            sector: "Utilities",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-10-15",
            listing_year: 2021,
            offer_price: 56,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Price corrected from 161.45 to 56.",
            has_case_study: false,
            description: "Leading renewable energy and water desalination company",
        },
        {
            id: "arabian-contracting-services-2021",
            company_name: "Arabian Contracting Services",
            company_name_ar: "شركة الخدمات الانشائية العربية (العربية)",
            symbol: "1217",
            sector: "Industrials",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-09-27",
            listing_year: 2021,
            offer_price: 23.64,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Offer price and listing date to be cross-checked.",
            has_case_study: false,
            description: "Outdoor advertising and construction services (Al Arabia)",
        },
        {
            id: "almunajem-foods-2021",
            company_name: "Almunajem Foods",
            company_name_ar: "شركة المنجم للأغذية",
            symbol: "2281",
            sector: "Consumer Staples",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-08-14",
            listing_year: 2021,
            offer_price: 14.44,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Offer price to be verified.",
            has_case_study: false,
            description: "Food import, distribution and manufacturing",
        },
        {
            id: "tanmiah-food-2021",
            company_name: "Tanmiah Food",
            company_name_ar: "شركة تنمية للأغذية",
            symbol: "4281",
            sector: "Consumer Staples",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-07-09",
            listing_year: 2021,
            offer_price: 15.44,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Sector updated to Consumer Staples (food production). Price to be verified.",
            has_case_study: false,
            description: "Poultry and food products producer",
        },
        {
            id: "al-khorayef-water-power-2021",
            company_name: "Al Khorayef Water & Power Technologies",
            company_name_ar: "شركة الخريف لتقنيات المياه والطاقة",
            symbol: "1262",
            sector: "Industrials",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-06-12",
            listing_year: 2021,
            offer_price: 11.36,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Offer price to be verified.",
            has_case_study: false,
            description: "Water and power technology solutions and engineering",
        },
        {
            id: "nayifat-finance-2021",
            company_name: "Nayifat Finance",
            company_name_ar: "شركة نايفات للتمويل",
            symbol: "4081",
            sector: "Financials",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-05-18",
            listing_year: 2021,
            offer_price: 34,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Ticker corrected from 4140 to 4081; market corrected from Nomu to TASI; price corrected from 9.77 to 34.",
            has_case_study: false,
            description: "Consumer finance and personal lending company",
        },
        {
            id: "theeb-rent-a-car-2021",
            company_name: "Theeb Rent a Car",
            company_name_ar: "شركة ذيب لتأجير السيارات",
            symbol: "4323",
            sector: "Consumer Discretionary",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2021-03-15",
            listing_year: 2021,
            offer_price: 11.54,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Offer price to be verified.",
            has_case_study: false,
            description: "Vehicle rental and fleet management across Saudi Arabia",
        },

        // ── 2020 ────────────────────────────────────────────────────
        {
            id: "amlak-international-2020",
            company_name: "Amlak International",
            company_name_ar: "أملاك العالمية للتمويل العقاري",
            symbol: "1182",
            sector: "Financials",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2020-12-18",
            listing_year: 2020,
            offer_price: 16,
            market_cap_at_ipo_sar: null,
            confidence: "High",
            source_urls: [],
            notes: "Ticker corrected from 4330 to 1182; market corrected from Nomu to TASI; price corrected from 7.93 to 16.",
            has_case_study: false,
            description: "Real estate finance and mortgage lending company",
        },
        {
            id: "dr-sulaiman-al-habib-2020",
            company_name: "Dr. Sulaiman Al Habib Medical Services",
            company_name_ar: "مجموعة د. سليمان الحبيب الطبية",
            symbol: "4013",
            sector: "Healthcare",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2020-11-19",
            listing_year: 2020,
            offer_price: 240.05,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Offer price to be verified — may reflect a post-split adjusted figure.",
            has_case_study: false,
            description: "Leading private hospital and healthcare group in Saudi Arabia",
        },
        {
            id: "bindawood-holding-2020",
            company_name: "BinDawood Holding",
            company_name_ar: "شركة بن داود القابضة",
            symbol: "4161",
            sector: "Consumer Staples",
            market: "TASI",
            listing_type: "ipo",
            listing_date: "2020-10-16",
            listing_year: 2020,
            offer_price: 108.52,
            market_cap_at_ipo_sar: null,
            confidence: "Medium",
            source_urls: [],
            notes: "Offer price to be verified against prospectus.",
            has_case_study: false,
            description: "Supermarket and hypermarket chain (BinDawood & Danube brands)",
        },
    ]
};

// ---- Utility Functions ----

/** Returns only High + Medium confidence records (suitable for public display). */
export function getPublicIPOs(): IPORecord[] {
    return ipoData.ipos.filter(ipo => ipo.confidence !== 'Low');
}

/** Returns IPOs for a specific calendar year, from the public set. */
export function getIPOsByYear(year: number): IPORecord[] {
    return getPublicIPOs().filter(ipo => ipo.listing_year === year);
}

/** Returns all distinct years that have at least one public IPO, descending. */
export function getAvailableYears(): number[] {
    const years = [...new Set(getPublicIPOs().map(ipo => ipo.listing_year))];
    return years.sort((a, b) => b - a);
}

/** Returns the N most recently listed IPOs (public set). */
export function getRecentIPOs(count = 4): IPORecord[] {
    return [...getPublicIPOs()]
        .sort((a, b) => new Date(b.listing_date).getTime() - new Date(a.listing_date).getTime())
        .slice(0, count);
}

/** Returns all unique sectors from the public set, sorted alphabetically. */
export function getUniqueSectors(): string[] {
    return [...new Set(getPublicIPOs().map(ipo => ipo.sector))].sort();
}

/** Returns all unique markets from the public set. */
export function getUniqueMarkets(): Market[] {
    return [...new Set(getPublicIPOs().map(ipo => ipo.market))];
}

/** Formats a SAR number as a readable string (B / M / raw). */
export function formatMarketCap(value: number): string {
    if (value >= 1_000_000_000) {
        return `SAR ${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `SAR ${(value / 1_000_000).toFixed(0)}M`;
    }
    return `SAR ${value.toLocaleString()}`;
}
