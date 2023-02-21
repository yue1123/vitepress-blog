import { useData as useData$ } from 'upress'
import type { DefaultTheme } from 'upress'

// @ts-nocheck
export const useData = useData$ as typeof useData$<DefaultTheme.Config>
