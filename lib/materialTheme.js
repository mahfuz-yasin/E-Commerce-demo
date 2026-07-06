import { createTheme } from "@mui/material";
import { Assistant } from "next/font/google";
const assistantFont = Assistant({
    weight: ["400", "500", "600", "700", "800"],
    display: "swap",
    subsets: ["latin"],
});

export const lightTheme = createTheme({
    colorSchemes: {
        light: true,
    },
    palette: {
        mode: "light",
        common: {
            black: "#030712",
            white: "#fff",
        },
        primary: {
            main: "#087ea4",
            light: "#149eca",
            dark: "#05607e",
        },
        secondary: {
            main: "#087ea4",
            light: "#e8f4f8",
        },
        background: {
            paper: "#ffffff",
            default: "#fafafa",
        },
        text: {
            primary: "#1a1a2e",
            secondary: "#6B7280",
        },
        success: {
            main: "#22c55e",
            light: "#4caf50",
            dark: "#1b5e20",
            contrastText: "#fff",
        },
    },
    typography: {
        fontFamily: assistantFont.style.fontFamily,
    },
    shadows: {
        0: "none",
        1: "0px 2px 1px -1px rgba(0,0,0,0.150),0px 1px 1px 0px rgba(0,0,0,0.150),0px 1px 3px 0px rgba(0,0,0,0.150)",
        2: "none",
        8: "0 5px 5px rgba(0, 0,0,0.15)",
    },
});

export const darkTheme = createTheme({
    colorSchemes: {
        dark: true,
    },
    palette: {
        mode: "dark",
        common: {
            black: "#030712",
            white: "#fff",
        },
        primary: {
            main: "#149eca",
            light: "#1cb0e0",
            dark: "#087ea4",
        },
        background: {
            paper: "#1a1f2e",
            default: "#141824",
        },
        text: {
            primary: "#d4d4d4",
            secondary: "#9ca3af",
        },
        action: {
            active: "#9ca3af",
        },
    },
    typography: {
        fontFamily: assistantFont.style.fontFamily,
    },
    shadows: {
        0: "none",
        1: "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
        2: "none",
        8: "0 5px 5px rgba(0, 0,0,0.15)",
    },
});