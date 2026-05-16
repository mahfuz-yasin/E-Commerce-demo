import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { IoMdStarOutline } from "react-icons/io";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiCoupon2Line, RiSlideshowLine, RiStarSLine, RiSettings3Line, RiFacebookCircleLine, RiMusicLine, RiSearchLine, RiUserLine } from "react-icons/ri";
import { Globe, BarChart3 } from "lucide-react";
import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW, ADMIN_ORDER_SHOW, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_ADD, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_REVIEW_SHOW, ADMIN_SLIDER, ADMIN_FEATURES_ADD, ADMIN_FEATURES_SHOW, ADMIN_SETTINGS, ADMIN_FACEBOOK_SETTINGS, ADMIN_FACEBOOK_PIXEL, ADMIN_FACEBOOK_BUSINESS, ADMIN_FACEBOOK_CATALOG, ADMIN_FACEBOOK_MESSENGER, ADMIN_FACEBOOK_ADVANCED, ADMIN_FACEBOOK_AUDIENCES, ADMIN_FACEBOOK_ANALYTICS, ADMIN_LEADS_DASHBOARD, ADMIN_FACEBOOK_LEAD_ADS, ADMIN_FACEBOOK_PROMOTIONS, ADMIN_FACEBOOK_CUSTOM_CONVERSIONS, ADMIN_FACEBOOK_AUDIT, ADMIN_FACEBOOK_CAMPAIGN_MANAGER, ADMIN_TIKTOK_SETTINGS, ADMIN_TIKTOK_ADS_DASHBOARD, ADMIN_TIKTOK_AUDIENCES, ADMIN_GOOGLE_SETTINGS, ADMIN_ANALYTICS } from "@/routes/AdminPanelRoute";


export const adminAppSidebarMenu = [
    {
        title: "Dashboard",
        url: ADMIN_DASHBOARD,
        icon: AiOutlineDashboard
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
        title: "Settings",
        url: "#",
        icon: RiSettings3Line,
        submenu: [
            {
                title: "Header",
                url: "/settings/header"
            },
            {
                title: "Footer",
                url: "/settings/footer"
            },
            {
                title: "Banner",
                url: "/settings/banner"
            },
            {
                title: "All Pages",
                url: "/settings/pages"
            },
            {
                title: "Create Page",
                url: "/settings/pages/create/builder"
            },
            {
                title: "All Landing Pages",
                url: "/settings/landing-pages"
            },
            {
                title: "Create Landing Page",
                url: "/settings/landing-pages/create/builder"
            },
        ]
    },
    {
        title: "Leads",
        url: ADMIN_LEADS_DASHBOARD,
        icon: LuUserRound
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
    }
]