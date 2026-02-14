// ============================================
// decoded.finance — IPO Data Model
// Based on IPO_DATA_MODEL.md schema
// ============================================

export interface IPORecord {
    id: string;
    company_name: string;
    company_name_ar: string;
    symbol: string;
    sector: string;
    listing_date: string;
    offer_price: number;
    market_cap_sar: number;
    market_cap_display: string;
    return_from_ipo: number;
    performance_badge: string;
    has_case_study: boolean;
    description: string;
}

export interface IPODataset {
    metadata: {
        last_updated: string;
        total_ipos: number;
        data_source: string;
        description: string;
    };
    summary_stats: {
        total_market_cap: number;
        average_return: number;
        best_performer: {
            company: string;
            return: number;
        };
        sectors: Record<string, number>;
    };
    ipos: IPORecord[];
}

// ---- Real IPO Data (19 Saudi IPOs, 2020-2025) ----

export const ipoData: IPODataset = {
    metadata: {
        last_updated: "2026-02-13",
        total_ipos: 19,
        data_source: "Abdul Gaffar Mohammed, CFA - decoded.finance",
        description: "Comprehensive Saudi Arabia IPO database (2020-2025) with performance tracking"
    },
    summary_stats: {
        total_market_cap: 158800000000,
        average_return: 38.7,
        best_performer: {
            company: "Saudi Tadawul Group",
            return: 133.3
        },
        sectors: {
            consumer_discretionary: 5,
            consumer_staples: 2,
            financials: 3,
            healthcare: 1,
            industrials: 3,
            real_estate: 2,
            technology: 2,
            utilities: 1
        }
    },
    ipos: [
        {
            id: "saudi-tadawul-group-2021",
            company_name: "Saudi Tadawul Group",
            company_name_ar: "مجموعة تداول السعودية القابضة",
            symbol: "1111",
            sector: "Financials",
            listing_date: "2021-12-14",
            offer_price: 112.48,
            market_cap_sar: 12600000000,
            market_cap_display: "SAR 12.6B",
            return_from_ipo: 133.3,
            performance_badge: "Top Performer",
            has_case_study: true,
            description: "Saudi stock exchange operator"
        },
        {
            id: "umm-al-qura-for-development-and-construction-company-2024",
            company_name: "Umm Al Qura Development",
            company_name_ar: "شركة أم القرى للتطوير والإعمار",
            symbol: "4162",
            sector: "Real Estate",
            listing_date: "2024-03-11",
            offer_price: 74.79,
            market_cap_sar: 7500000000,
            market_cap_display: "SAR 7.5B",
            return_from_ipo: 112.5,
            performance_badge: "Top Performer",
            has_case_study: true,
            description: "Real estate development in Mecca near Holy Mosque"
        },
        {
            id: "acwa-power-company-2021",
            company_name: "ACWA Power",
            company_name_ar: "شركة أكوا باور",
            symbol: "2082",
            sector: "Utilities",
            listing_date: "2021-10-15",
            offer_price: 161.45,
            market_cap_sar: 36000000000,
            market_cap_display: "SAR 36.0B",
            return_from_ipo: 88.1,
            performance_badge: "Strong Performer",
            has_case_study: true,
            description: "Renewable energy and power generation leader"
        },
        {
            id: "dr-sulaiman-al-habib-medical-services-group-2020",
            company_name: "Dr. Sulaiman Al Habib Medical Services",
            company_name_ar: "مجموعة د. سليمان الحبيب الطبية",
            symbol: "4013",
            sector: "Healthcare",
            listing_date: "2020-11-19",
            offer_price: 240.05,
            market_cap_sar: 57100000000,
            market_cap_display: "SAR 57.1B",
            return_from_ipo: 85.1,
            performance_badge: "Strong Performer",
            has_case_study: true,
            description: "Leading private healthcare provider in Saudi Arabia"
        },
        {
            id: "flynas-airlines-2024",
            company_name: "Flynas Airlines",
            company_name_ar: "طيران ناس",
            symbol: "4095",
            sector: "Consumer Discretionary",
            listing_date: "2024-06-22",
            offer_price: 66.47,
            market_cap_sar: 5800000000,
            market_cap_display: "SAR 5.8B",
            return_from_ipo: 75.6,
            performance_badge: "Strong Performer",
            has_case_study: true,
            description: "Low-cost airline capitalizing on tourism growth"
        },
        {
            id: "bindawood-holding-company-2020",
            company_name: "BinDawood Holding",
            company_name_ar: "شركة بن داود القابضة",
            symbol: "4161",
            sector: "Consumer Staples",
            listing_date: "2020-10-16",
            offer_price: 108.52,
            market_cap_sar: 12000000000,
            market_cap_display: "SAR 12.0B",
            return_from_ipo: 40.0,
            performance_badge: "Solid",
            has_case_study: true,
            description: "Major supermarket and hypermarket chain"
        },
        {
            id: "theeb-rent-a-car-company-2021",
            company_name: "Theeb Rent a Car",
            company_name_ar: "شركة ذيب لتأجير السيارات",
            symbol: "4323",
            sector: "Consumer Discretionary",
            listing_date: "2021-03-15",
            offer_price: 11.54,
            market_cap_sar: 2250000000,
            market_cap_display: "SAR 2.3B",
            return_from_ipo: 33.9,
            performance_badge: "Solid",
            has_case_study: true,
            description: "Car rental services across Saudi Arabia"
        },
        {
            id: "al-khorayef-water-and-power-technologies-company-2021",
            company_name: "Al Khorayef Water & Power Technologies",
            company_name_ar: "شركة الخريف لتقنيات المياه والطاقة",
            symbol: "1262",
            sector: "Industrials",
            listing_date: "2021-06-12",
            offer_price: 11.36,
            market_cap_sar: 2750000000,
            market_cap_display: "SAR 2.8B",
            return_from_ipo: 32.8,
            performance_badge: "Solid",
            has_case_study: true,
            description: "Water and power technology solutions"
        },
        {
            id: "alkhabeer-income-fund-reit-2021",
            company_name: "Alkhabeer Income Fund REIT",
            company_name_ar: "صندوق الخبير ريت",
            symbol: "4338",
            sector: "Real Estate",
            listing_date: "2021-04-12",
            offer_price: 7.71,
            market_cap_sar: 1250000000,
            market_cap_display: "SAR 1.3B",
            return_from_ipo: 28.2,
            performance_badge: "Solid",
            has_case_study: false,
            description: "Real estate investment trust"
        },
        {
            id: "almasar-alshamil-education-company-2025",
            company_name: "Almasar Alshamil Education",
            company_name_ar: "شركة المسار الشامل للتعليم",
            symbol: "4210",
            sector: "Consumer Discretionary",
            listing_date: "2025-02-18",
            offer_price: 14.51,
            market_cap_sar: 2000000000,
            market_cap_display: "SAR 2.0B",
            return_from_ipo: 22.1,
            performance_badge: "Positive",
            has_case_study: false,
            description: "Private education services"
        },
        {
            id: "nayifat-finance-company-2021",
            company_name: "Nayifat Finance",
            company_name_ar: "شركة نايفات للتمويل",
            symbol: "4140",
            sector: "Financials",
            listing_date: "2021-05-18",
            offer_price: 9.77,
            market_cap_sar: 1000000000,
            market_cap_display: "SAR 1.0B",
            return_from_ipo: 15.5,
            performance_badge: "Positive",
            has_case_study: true,
            description: "Consumer finance company (Nomu market)"
        },
        {
            id: "almunajem-foods-company-2021",
            company_name: "Almunajem Foods",
            company_name_ar: "شركة المنجم للأغذية",
            symbol: "2281",
            sector: "Consumer Staples",
            listing_date: "2021-08-14",
            offer_price: 14.44,
            market_cap_sar: 1800000000,
            market_cap_display: "SAR 1.8B",
            return_from_ipo: 11.2,
            performance_badge: "Positive",
            has_case_study: false,
            description: "Food products and distribution"
        },
        {
            id: "east-pipes-integrated-company-2022",
            company_name: "East Pipes Integrated",
            company_name_ar: "شركة أنابيب الشرق المتكاملة",
            symbol: "1321",
            sector: "Industrials",
            listing_date: "2022-06-12",
            offer_price: 20.29,
            market_cap_sar: 2600000000,
            market_cap_display: "SAR 2.6B",
            return_from_ipo: 8.9,
            performance_badge: "Positive",
            has_case_study: false,
            description: "Steel pipes for oil & gas infrastructure"
        },
        {
            id: "cherry-trading-company-2025",
            company_name: "Cherry Trading",
            company_name_ar: "شركة شيري للتجارة",
            symbol: "4199",
            sector: "Consumer Discretionary",
            listing_date: "2025-01-10",
            offer_price: 12.36,
            market_cap_sar: 1400000000,
            market_cap_display: "SAR 1.4B",
            return_from_ipo: 6.6,
            performance_badge: "Neutral",
            has_case_study: true,
            description: "Auto rental and trading services"
        },
        {
            id: "stc-solutions-2021",
            company_name: "stc solutions",
            company_name_ar: "خدمات الإنترنت والاتصالات (حلول stc)",
            symbol: "2310",
            sector: "Technology",
            listing_date: "2021-11-11",
            offer_price: 42.16,
            market_cap_sar: 4600000000,
            market_cap_display: "SAR 4.6B",
            return_from_ipo: -2.6,
            performance_badge: "Underperformer",
            has_case_study: false,
            description: "Internet and communications services"
        },
        {
            id: "amlak-international-for-real-estate-finance-2020",
            company_name: "Amlak International",
            company_name_ar: "أملاك العالمية للتمويل العقاري",
            symbol: "4330",
            sector: "Financials",
            listing_date: "2020-12-18",
            offer_price: 7.93,
            market_cap_sar: 1500000000,
            market_cap_display: "SAR 1.5B",
            return_from_ipo: -3.8,
            performance_badge: "Underperformer",
            has_case_study: true,
            description: "Real estate finance company"
        },
        {
            id: "elm-company-2022",
            company_name: "Elm Company",
            company_name_ar: "شركة علم",
            symbol: "2370",
            sector: "Technology",
            listing_date: "2022-12-22",
            offer_price: 15.4,
            market_cap_sar: 3500000000,
            market_cap_display: "SAR 3.5B",
            return_from_ipo: -5.1,
            performance_badge: "Underperformer",
            has_case_study: false,
            description: "Digital security and e-government solutions"
        },
        {
            id: "tanmiah-food-company-2021",
            company_name: "Tanmiah Food",
            company_name_ar: "شركة تنمية للأغذية",
            symbol: "4281",
            sector: "Consumer Discretionary",
            listing_date: "2021-07-09",
            offer_price: 15.44,
            market_cap_sar: 1600000000,
            market_cap_display: "SAR 1.6B",
            return_from_ipo: -6.2,
            performance_badge: "Underperformer",
            has_case_study: false,
            description: "Food products and poultry"
        },
        {
            id: "arabian-contracting-services-company-al-arabia-2021",
            company_name: "Arabian Contracting Services (Al Arabia)",
            company_name_ar: "شركة الخدمات الانشائية العربية (العربية)",
            symbol: "1217",
            sector: "Industrials",
            listing_date: "2021-09-17",
            offer_price: 23.64,
            market_cap_sar: 3000000000,
            market_cap_display: "SAR 3.0B",
            return_from_ipo: -11.9,
            performance_badge: "Underperformer",
            has_case_study: true,
            description: "Construction and contracting services"
        }
    ]
};

// ---- Utility Functions ----

export function getTopPerformers(count = 5): IPORecord[] {
    return [...ipoData.ipos]
        .sort((a, b) => b.return_from_ipo - a.return_from_ipo)
        .slice(0, count);
}

export function getRecentIPOs(count = 4): IPORecord[] {
    return [...ipoData.ipos]
        .sort((a, b) => new Date(b.listing_date).getTime() - new Date(a.listing_date).getTime())
        .slice(0, count);
}

export function getIPOsWithCaseStudies(): IPORecord[] {
    return ipoData.ipos.filter(ipo => ipo.has_case_study);
}

export function getUniqueSectors(): string[] {
    return [...new Set(ipoData.ipos.map(ipo => ipo.sector))].sort();
}

export function formatMarketCap(value: number): string {
    if (value >= 1_000_000_000) {
        return `SAR ${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `SAR ${(value / 1_000_000).toFixed(0)}M`;
    }
    return `SAR ${value.toLocaleString()}`;
}
