import type { DefaultTheme } from 'penpress/theme';
export interface SidebarLink {
    text: string;
    link: string;
}
/**
 * Get the `Sidebar` from sidebar option. This method will ensure to get correct
 * sidebar config from `MultiSideBarConfig` with various path combinations such
 * as matching `guide/` and `/guide/`. If no matching config was found, it will
 * return empty array.
 */
export declare function getSidebar(sidebar: DefaultTheme.Sidebar | undefined, path: string): DefaultTheme.SidebarItem[];
/**
 * Get or generate sidebar group from the given sidebar items.
 */
export declare function getSidebarGroups(sidebar: DefaultTheme.SidebarItem[]): DefaultTheme.SidebarItem[];
export declare function getFlatSideBarLinks(sidebar: DefaultTheme.SidebarItem[]): SidebarLink[];
/**
 * Check if the given sidebar item contains any active link.
 */
export declare function hasActiveLink(path: string, items: DefaultTheme.SidebarItem | DefaultTheme.SidebarItem[]): boolean;
