import { type ComputedRef, type Ref } from 'vue';
import type { DefaultTheme } from 'penpress/theme';
export interface SidebarControl {
    collapsed: Ref<boolean>;
    collapsible: ComputedRef<boolean>;
    isLink: ComputedRef<boolean>;
    isActiveLink: ComputedRef<boolean>;
    hasActiveLink: ComputedRef<boolean>;
    hasChildren: ComputedRef<boolean>;
    toggle(): void;
}
export declare function useSidebar(): {
    isOpen: Ref<boolean>;
    sidebar: ComputedRef<DefaultTheme.SidebarItem[]>;
    sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>;
    hasSidebar: ComputedRef<boolean>;
    hasAside: ComputedRef<boolean>;
    isSidebarEnabled: ComputedRef<boolean>;
    open: () => void;
    close: () => void;
    toggle: () => void;
};
/**
 * a11y: cache the element that opened the Sidebar (the menu button) then
 * focus that button again when Menu is closed with Escape key.
 */
export declare function useCloseSidebarOnEscape(isOpen: Ref<boolean>, close: () => void): void;
export declare function useSidebarControl(item: ComputedRef<DefaultTheme.SidebarItem>): SidebarControl;
