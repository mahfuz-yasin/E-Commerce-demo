import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { IoMdStarOutline } from "react-icons/io";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiCoupon2Line, RiSlideshowLine, RiStarSLine, RiSettings3Line, RiFacebookCircleLine, RiMusicLine, RiSearchLine, RiUserLine, RiInstagramLine } from "react-icons/ri";
import { Globe, BarChart3, Truck, ShoppingBag, Hash, Users, Video, MessageCircle, Target, Zap, Trophy, Store, Camera, Shield, Package, UserCog, TrendingUp, Zap as FlashIcon, Tag, MessageSquare, FileText, Phone } from "lucide-react";
import { ADMIN_UPBANNER, ADMIN_UPBANNER_ADD, ADMIN_BANNER_ADD, ADMIN_BANNER_SHOW, ADMIN_DOWNBANNER, ADMIN_DOWNBANNER_ADD, ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW, ADMIN_ORDER_SHOW, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_ADD, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_REVIEW_SHOW, ADMIN_SLIDER, ADMIN_FEATURES_ADD, ADMIN_FEATURES_SHOW, ADMIN_SETTINGS, ADMIN_FACEBOOK_SETTINGS, ADMIN_FACEBOOK_PIXEL, ADMIN_FACEBOOK_BUSINESS, ADMIN_FACEBOOK_CATALOG, ADMIN_FACEBOOK_MESSENGER, ADMIN_FACEBOOK_ADVANCED, ADMIN_FACEBOOK_AUDIENCES, ADMIN_FACEBOOK_ANALYTICS, ADMIN_FACEBOOK_LEAD_ADS, ADMIN_LEADS_DASHBOARD, ADMIN_FACEBOOK_PROMOTIONS, ADMIN_FACEBOOK_CUSTOM_CONVERSIONS, ADMIN_FACEBOOK_AUDIT, ADMIN_FACEBOOK_CAMPAIGN_MANAGER, ADMIN_FACEBOOK_DYNAMIC_ADS, ADMIN_FACEBOOK_AB_TESTING, ADMIN_FACEBOOK_BUDGET_OPTIMIZATION, ADMIN_FACEBOOK_SEGMENTS, ADMIN_FACEBOOK_RETARGETING, ADMIN_FACEBOOK_ATTRIBUTION, ADMIN_FACEBOOK_PERFORMANCE_METRICS, ADMIN_FACEBOOK_CHATBOT, ADMIN_FACEBOOK_AUTO_RESPONSES, ADMIN_FACEBOOK_ABANDONED_CART, ADMIN_FACEBOOK_LEAD_SCORING, ADMIN_TIKTOK_SETTINGS, ADMIN_TIKTOK_ADS_DASHBOARD, ADMIN_TIKTOK_AUDIENCES, ADMIN_GOOGLE_SETTINGS, ADMIN_ANALYTICS, ADMIN_CONTACT_INQUIRY, ADMIN_CONTACT_CONFIG, ADMIN_COURIER_SETTINGS, ADMIN_COURIER_STEADFAST, ADMIN_COURIER_PATHAO, ADMIN_INSTAGRAM_SETTINGS, ADMIN_INSTAGRAM_BUSINESS, ADMIN_INSTAGRAM_SHOPPING, ADMIN_INSTAGRAM_CONTENT, ADMIN_INSTAGRAM_ANALYTICS, ADMIN_INSTAGRAM_MESSAGING, ADMIN_INSTAGRAM_ADS, ADMIN_INSTAGRAM_AUDIENCES, ADMIN_INSTAGRAM_HASHTAGS, ADMIN_INSTAGRAM_INFLUENCERS, ADMIN_INSTAGRAM_STORIES, ADMIN_INSTAGRAM_REELS, ADMIN_INSTAGRAM_LIVE, ADMIN_INSTAGRAM_INSIGHTS, ADMIN_INSTAGRAM_PRODUCT_TAGGING, ADMIN_INSTAGRAM_AUTOMATION, ADMIN_INSTAGRAM_COLLABORATIONS, ADMIN_INSTAGRAM_CONTESTS, ADMIN_INSTAGRAM_SHOP_SETUP, ADMIN_INSTAGRAM_PIXEL, ADMIN_FRAUD_GUARD, ADMIN_FRAUD_GUARD_BLOCKED, ADMIN_INVENTORY, ADMIN_INVENTORY_PURCHASES, ADMIN_INVENTORY_PURCHASE_ADD, ADMIN_SUPPLIERS, ADMIN_STAFF, ADMIN_STAFF_ADD, ADMIN_REPORTS_PROFIT_LOSS, ADMIN_REPORTS_ADS_SOURCE, ADMIN_REPORTS_STOCK, ADMIN_FLASH_SALE, ADMIN_FLASH_SALE_ADD, ADMIN_SHIPPING_RULES, ADMIN_SMS_BULK, ADMIN_SMS_LOGS, ADMIN_COURIER_MISSING_PARCELS } from "@/routes/AdminPanelRoute";


export const adminAppSidebarMenu = [
    {
        title: "Dashboard",
        url: ADMIN_DASHBOARD,
        icon: AiOutlineDashboard
    },
    {
        title: "Online View",
        url: "https://alhilalpanjabi.com",
        icon: Globe
    },
    {
        title: "Category",
        url: "#",
        icon: BiCategory,
        submenu: [
            {
                title: "Add Category",
                url: ADMIN_CATEGORY_ADD
            },
            {
                title: "All Category",
                url: ADMIN_CATEGORY_SHOW
            }
        ]
    },
    {
        title: "Products",
        url: "#",
        icon: IoShirtOutline,
        submenu: [
            {
                title: "Add Product",
                url: ADMIN_PRODUCT_ADD
            },
            {
                title: "Add Variant",
                url: ADMIN_PRODUCT_VARIANT_ADD
            },
            {
                title: "All Products",
                url: ADMIN_PRODUCT_SHOW
            },
            {
                title: "Product Variants",
                url: ADMIN_PRODUCT_VARIANT_SHOW
            },
        ]
    },
    {
        title: "Coupons",
        url: "#",
        icon: RiCoupon2Line,
        submenu: [
            {
                title: "Add Coupon",
                url: ADMIN_COUPON_ADD
            },
            {
                title: "All Coupons",
                url: ADMIN_COUPON_SHOW
            },

        ]
    },
    {
        title: "Orders",
        url: ADMIN_ORDER_SHOW,
        icon: MdOutlineShoppingBag,

    },
    {
        title: "Customers",
        url: ADMIN_CUSTOMERS_SHOW,
        icon: LuUserRound,
    },
    {
        title: "Rating & Review",
        url: ADMIN_REVIEW_SHOW,
        icon: IoMdStarOutline,
    },
    {
        title: "Media",
        url: ADMIN_MEDIA_SHOW,
        icon: MdOutlinePermMedia,
    },
    {
        title: "Hero Slider",
        url: ADMIN_SLIDER,
        icon: RiSlideshowLine,
    },
    {
        title: "Up Banner",
        url: "#",
        icon: RiSlideshowLine,
        submenu: [
            {
                title: "Add Banner",
                url: ADMIN_UPBANNER_ADD
            },
            {
                title: "All Banner",
                url: ADMIN_UPBANNER
            }
        ]
    },
    {
        title: "Down Banner",
        url: "#",
        icon: RiSlideshowLine,
        submenu: [
            {
                title: "Add Banner",
                url: ADMIN_DOWNBANNER_ADD
            },
            {
                title: "All Banner",
                url: ADMIN_DOWNBANNER
            }
        ]
    },
    {
        title: "Features",
        url: "#",
        icon: RiStarSLine,
        submenu: [
            {
                title: "Add Feature",
                url: ADMIN_FEATURES_ADD
            },
            {
                title: "All Features",
                url: ADMIN_FEATURES_SHOW
            },
        ]
    },
    {
        title: "Pages",
        url: "#",
        icon: RiSlideshowLine,
        submenu: [
            {
                title: "Create Page",
                url: "/admin/settings/pages/create/builder"
            },
            {
                title: "All Pages",
                url: "/admin/settings/pages"
            }
        ]
    },
    {
        title: "Landing Pages",
        url: "#",
        icon: RiSlideshowLine,
        submenu: [
            {
                title: "Create Landing Page",
                url: "/admin/settings/landing-pages/create/builder"
            },
            {
                title: "All Landing Pages",
                url: "/admin/settings/landing-pages"
            }
        ]
    },
    {
        title: "Settings",
        url: "#",
        icon: RiSettings3Line,
        submenu: [
            {
                title: "Header",
                url: "/admin/settings/header"
            },
            {
                title: "Footer",
                url: "/admin/settings/footer"
            },
            {
                title: "Banner",
                url: "#",
                submenu: [
                    {
                        title: "Add Banner",
                        url: "/admin/settings/banner/add"
                    },
                    {
                        title: "All Banner",
                        url: "/admin/settings/banner"
                    }
                ]
            },
            {
                title: "About Us",
                url: "/admin/settings/about-us"
            }
        ]
    },
    {
        title: "Leads",
        url: ADMIN_LEADS_DASHBOARD,
        icon: LuUserRound
    },
    {
        title: "Contact",
        url: "#",
        icon: RiUserLine,
        submenu: [
            {
                title: "Inquiries",
                url: ADMIN_CONTACT_INQUIRY
            },
            {
                title: "Configuration",
                url: ADMIN_CONTACT_CONFIG
            }
        ]
    },
    {
        title: "Facebook Settings",
        url: ADMIN_FACEBOOK_SETTINGS,
        icon: RiFacebookCircleLine,
        submenu: [
            {
                title: "Pixel & CAPI",
                url: ADMIN_FACEBOOK_PIXEL,
                icon: RiFacebookCircleLine
            },
            {
                title: "Business Manager",
                url: ADMIN_FACEBOOK_BUSINESS,
                icon: RiFacebookCircleLine
            },
            {
                title: "Catalog",
                url: ADMIN_FACEBOOK_CATALOG,
                icon: RiFacebookCircleLine
            },
            {
                title: "Messenger",
                url: ADMIN_FACEBOOK_MESSENGER,
                icon: RiFacebookCircleLine
            },
            {
                title: "Advanced",
                url: ADMIN_FACEBOOK_ADVANCED,
                icon: RiFacebookCircleLine
            },
            {
                title: "Audiences",
                url: ADMIN_FACEBOOK_AUDIENCES,
                icon: RiFacebookCircleLine
            },
            {
                title: "Analytics",
                url: ADMIN_FACEBOOK_ANALYTICS,
                icon: RiFacebookCircleLine
            },
            {
                title: "Lead Ads",
                url: ADMIN_FACEBOOK_LEAD_ADS,
                icon: RiFacebookCircleLine
            },
            {
                title: "Promotions",
                url: ADMIN_FACEBOOK_PROMOTIONS,
                icon: RiFacebookCircleLine
            },
            {
                title: "Custom Conversions",
                url: ADMIN_FACEBOOK_CUSTOM_CONVERSIONS,
                icon: RiFacebookCircleLine
            },
            {
                title: "System Audit",
                url: ADMIN_FACEBOOK_AUDIT,
                icon: RiFacebookCircleLine
            },
            {
                title: "Campaign Manager",
                url: ADMIN_FACEBOOK_CAMPAIGN_MANAGER,
                icon: RiFacebookCircleLine
            },
            {
                title: "Dynamic Product Ads",
                url: ADMIN_FACEBOOK_DYNAMIC_ADS,
                icon: RiFacebookCircleLine
            },
            {
                title: "A/B Testing",
                url: ADMIN_FACEBOOK_AB_TESTING,
                icon: RiFacebookCircleLine
            },
            {
                title: "Budget Optimization",
                url: ADMIN_FACEBOOK_BUDGET_OPTIMIZATION,
                icon: RiFacebookCircleLine
            },
            {
                title: "Custom Segments",
                url: ADMIN_FACEBOOK_SEGMENTS,
                icon: RiFacebookCircleLine
            },
            {
                title: "Retargeting Automation",
                url: ADMIN_FACEBOOK_RETARGETING,
                icon: RiFacebookCircleLine
            },
            {
                title: "Multi-Touch Attribution",
                url: ADMIN_FACEBOOK_ATTRIBUTION,
                icon: RiFacebookCircleLine
            },
            {
                title: "Performance Metrics",
                url: ADMIN_FACEBOOK_PERFORMANCE_METRICS,
                icon: RiFacebookCircleLine
            },
            {
                title: "Chatbot Automation",
                url: ADMIN_FACEBOOK_CHATBOT,
                icon: RiFacebookCircleLine
            },
            {
                title: "Automated Responses",
                url: ADMIN_FACEBOOK_AUTO_RESPONSES,
                icon: RiFacebookCircleLine
            },
            {
                title: "Abandoned Cart Recovery",
                url: ADMIN_FACEBOOK_ABANDONED_CART,
                icon: RiFacebookCircleLine
            },
            {
                title: "Lead Scoring",
                url: ADMIN_FACEBOOK_LEAD_SCORING,
                icon: RiFacebookCircleLine
            }
        ]
    },
    {
        title: "TikTok Settings",
        url: ADMIN_TIKTOK_SETTINGS,
        icon: RiMusicLine,
        submenu: [
            {
                title: "Settings",
                url: ADMIN_TIKTOK_SETTINGS,
                icon: RiSettings3Line
            },
            {
                title: "Ads Dashboard",
                url: ADMIN_TIKTOK_ADS_DASHBOARD,
                icon: RiMusicLine
            },
            {
                title: "Audiences",
                url: ADMIN_TIKTOK_AUDIENCES,
                icon: RiUserLine
            }
        ]
    },
    {
        title: "Google",
        url: "#",
        icon: Globe,
        submenu: [
            {
                title: "Google Settings",
                url: ADMIN_GOOGLE_SETTINGS,
                icon: RiSettings3Line
            },
            {
                title: "Analytics",
                url: ADMIN_ANALYTICS,
                icon: BarChart3
            }
        ]
    },
    {
        title: "Couriers",
        url: ADMIN_COURIER_SETTINGS,
        icon: Truck,
        submenu: [
            {
                title: "Steadfast Settings",
                url: ADMIN_COURIER_STEADFAST
            },
            {
                title: "Pathao Settings",
                url: ADMIN_COURIER_PATHAO
            },
            {
                title: "Missing Parcels",
                url: ADMIN_COURIER_MISSING_PARCELS
            }
        ]
    },
    {
        title: "Instagram Business",
        url: ADMIN_INSTAGRAM_SETTINGS,
        icon: RiInstagramLine,
        submenu: [
            {
                title: "Business Account",
                url: ADMIN_INSTAGRAM_BUSINESS,
                icon: Store
            },
            {
                title: "Shop Setup",
                url: ADMIN_INSTAGRAM_SHOP_SETUP,
                icon: ShoppingBag
            },
            {
                title: "Product Tagging",
                url: ADMIN_INSTAGRAM_PRODUCT_TAGGING,
                icon: ShoppingBag
            },
            {
                title: "Content Manager",
                url: ADMIN_INSTAGRAM_CONTENT,
                icon: Camera
            },
            {
                title: "Stories & Highlights",
                url: ADMIN_INSTAGRAM_STORIES,
                icon: Camera
            },
            {
                title: "Reels Manager",
                url: ADMIN_INSTAGRAM_REELS,
                icon: Video
            },
            {
                title: "Live Commerce",
                url: ADMIN_INSTAGRAM_LIVE,
                icon: Video
            },
            {
                title: "Direct Messaging",
                url: ADMIN_INSTAGRAM_MESSAGING,
                icon: MessageCircle
            },
            {
                title: "Automation",
                url: ADMIN_INSTAGRAM_AUTOMATION,
                icon: Zap
            },
            {
                title: "Ads Manager",
                url: ADMIN_INSTAGRAM_ADS,
                icon: Target
            },
            {
                title: "Audiences",
                url: ADMIN_INSTAGRAM_AUDIENCES,
                icon: Users
            },
            {
                title: "Hashtag Strategy",
                url: ADMIN_INSTAGRAM_HASHTAGS,
                icon: Hash
            },
            {
                title: "Influencer Hub",
                url: ADMIN_INSTAGRAM_INFLUENCERS,
                icon: Users
            },
            {
                title: "Collaborations",
                url: ADMIN_INSTAGRAM_COLLABORATIONS,
                icon: Users
            },
            {
                title: "Contests & Giveaways",
                url: ADMIN_INSTAGRAM_CONTESTS,
                icon: Trophy
            },
            {
                title: "Analytics & Insights",
                url: ADMIN_INSTAGRAM_ANALYTICS,
                icon: BarChart3
            },
            {
                title: "Detailed Insights",
                url: ADMIN_INSTAGRAM_INSIGHTS,
                icon: BarChart3
            },
            {
                title: "Pixel & Conversions",
                url: ADMIN_INSTAGRAM_PIXEL,
                icon: Target
            }
        ]
    },
    {
        title: "Fraud Guard",
        url: ADMIN_FRAUD_GUARD,
        icon: Shield,
        submenu: [
            {
                title: "Fraud Dashboard",
                url: ADMIN_FRAUD_GUARD,
            },
            {
                title: "Blocked Customers",
                url: ADMIN_FRAUD_GUARD_BLOCKED,
            },
        ]
    },
    {
        title: "Inventory",
        url: ADMIN_INVENTORY,
        icon: Package,
        submenu: [
            {
                title: "All Purchases",
                url: ADMIN_INVENTORY_PURCHASES,
            },
            {
                title: "Add Purchase",
                url: ADMIN_INVENTORY_PURCHASE_ADD,
            },
            {
                title: "Suppliers",
                url: ADMIN_SUPPLIERS,
            },
        ]
    },
    {
        title: "Staff",
        url: ADMIN_STAFF,
        icon: UserCog,
        submenu: [
            {
                title: "All Staff",
                url: ADMIN_STAFF,
            },
            {
                title: "Add Staff",
                url: ADMIN_STAFF_ADD,
            },
        ]
    },
    {
        title: "Reports",
        url: ADMIN_REPORTS_PROFIT_LOSS,
        icon: TrendingUp,
        submenu: [
            {
                title: "Profit & Loss",
                url: ADMIN_REPORTS_PROFIT_LOSS,
            },
            {
                title: "Ads Source Report",
                url: ADMIN_REPORTS_ADS_SOURCE,
            },
            {
                title: "Stock Report",
                url: ADMIN_REPORTS_STOCK,
            },
        ]
    },
    {
        title: "Flash Sale",
        url: ADMIN_FLASH_SALE,
        icon: FlashIcon,
        submenu: [
            {
                title: "All Flash Sales",
                url: ADMIN_FLASH_SALE,
            },
            {
                title: "Create Flash Sale",
                url: ADMIN_FLASH_SALE_ADD,
            },
        ]
    },
    {
        title: "Shipping Rules",
        url: ADMIN_SHIPPING_RULES,
        icon: Tag,
    },
    {
        title: "SMS",
        url: ADMIN_SMS_BULK,
        icon: MessageSquare,
        submenu: [
            {
                title: "Bulk SMS",
                url: ADMIN_SMS_BULK,
            },
            {
                title: "SMS Logs",
                url: ADMIN_SMS_LOGS,
            },
        ]
    },
]