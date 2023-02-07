export declare function useLangs({ removeCurrent, correspondingLink }?: {
    removeCurrent?: boolean | undefined;
    correspondingLink?: boolean | undefined;
}): {
    localeLinks: import("vue").ComputedRef<{
        text: any;
        link: string;
    }[]>;
    currentLang: import("vue").ComputedRef<{
        label: any;
        link: any;
    }>;
};
