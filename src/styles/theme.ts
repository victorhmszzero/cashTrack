// src\styles\theme.ts
// ─── Theme type ──────────────────────────────────────────────────────────────

export interface Theme {
	bg: {
		page: string;
		card: string;
		subtle: string; // inputs, alternating rows
		hover: string; // hover states
	};
	text: {
		primary: string;
		secondary: string;
		muted: string;
		faint: string;
	};
	border: string;
	shadow: string;
	accent: string; // primary brand color (dynamic)
	accentSoft: string; // accent at ~12% opacity (hover, focus rings)
	success: string;
	danger: string;
	warning: string;
	radius: {
		sm: string; // 8px
		md: string; // 12px
		lg: string; // 16px
		xl: string; // 20px
	};
	font: {
		sans: string;
		mono: string;
	};
	isDark: boolean;
}

// ─── Theme builders ───────────────────────────────────────────────────────────

export function buildTheme(accentHex: string, dark: boolean): Theme {
	const accent = accentHex || "#3b82f6";
	// hex + '20' gives ~12% opacity as hex alpha
	const accentSoft = `${accent}20`;

	if (dark) {
		return {
			bg: {
				page: "#0f172a",
				card: "#1e293b",
				subtle: "#0f172a",
				hover: "rgba(255,255,255,0.05)",
			},
			text: {
				primary: "#f8fafc",
				secondary: "#cbd5e1",
				muted: "#94a3b8",
				faint: "#475569",
			},
			border: "#334155",
			shadow: "0 1px 4px rgba(0,0,0,0.5)",
			accent,
			accentSoft,
			success: "#10b981",
			danger: "#ef4444",
			warning: "#f59e0b",
			radius: { sm: "8px", md: "12px", lg: "16px", xl: "20px" },
			font: {
				sans: "'Sora', sans-serif",
				mono: "'JetBrains Mono', monospace",
			},
			isDark: true,
		};
	}

	return {
		bg: {
			page: "#f9fafb",
			card: "#ffffff",
			subtle: "#f1f5f9",
			hover: "rgba(0,0,0,0.04)",
		},
		text: {
			primary: "#0f172a",
			secondary: "#334155",
			muted: "#64748b",
			faint: "#94a3b8",
		},
		border: "#e2e8f0",
		shadow: "0 1px 3px rgba(0,0,0,0.07)",
		accent,
		accentSoft,
		success: "#059669",
		danger: "#dc2626",
		warning: "#d97706",
		radius: { sm: "8px", md: "12px", lg: "16px", xl: "20px" },
		font: {
			sans: "'Sora', sans-serif",
			mono: "'JetBrains Mono', monospace",
		},
		isDark: false,
	};
}

// ─── TypeScript: tell styled-components about our theme ───────────────────────

import "styled-components";
declare module "styled-components" {
	export interface DefaultTheme extends Theme {}
}
