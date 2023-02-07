import type { DefaultTheme } from 'penpress/theme';
import { type Ref } from 'vue';
import type { Header } from '../../shared.js';
export type MenuItem = Omit<Header, 'slug' | 'children'> & {
    children?: MenuItem[];
};
export declare function getHeaders(pageOutline: DefaultTheme.Config['outline'], outlineBadges: DefaultTheme.Config['outlineBadges']): MenuItem[];
export declare function resolveHeaders(headers: MenuItem[], range?: Exclude<DefaultTheme.Config['outline'], false>): MenuItem[];
export declare function useActiveAnchor(container: Ref<HTMLElement>, marker: Ref<HTMLElement>): void;
