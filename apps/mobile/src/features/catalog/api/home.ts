import { useQuery } from '@tanstack/react-query';

import { POINTS_DEFAULTS } from '@vivodha/shared/constants';

import { supabase } from '@/lib/supabase';

import { publicImageUrl } from './catalog';

export type Banner = { id: string; title: string; imageUrl: string; deepLink: string | null };

export type HomeSectionType =
  | 'banner_carousel'
  | 'category_grid'
  | 'shopping_list_entry'
  | 'rail_deals'
  | 'rail_best_sellers'
  | 'rail_top_picks'
  | 'rail_recently_viewed'
  | 'rail_collection';

export type HomeSection = { id: string; type: HomeSectionType; title: string | null };

export type StoreSettings = {
  freeDeliveryThresholdPaise: number;
  deliveryFeePaise: number;
  pointsEarnRupeesPerPoint: number;
};

export type HomeData = { banners: Banner[]; sections: HomeSection[]; settings: StoreSettings };

/** Fallbacks if store_config is missing keys (runtime source of truth is the DB). */
const DEFAULT_SETTINGS: StoreSettings = {
  freeDeliveryThresholdPaise: 49900,
  deliveryFeePaise: 2500,
  pointsEarnRupeesPerPoint: POINTS_DEFAULTS.earnRupeesPerPoint,
};

function readNumber(source: unknown, path: string[]): number | undefined {
  let cur: unknown = source;
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === 'number' ? cur : undefined;
}

async function fetchHome(): Promise<HomeData> {
  const [bannersRes, sectionsRes, configRes] = await Promise.all([
    supabase
      .from('banners')
      .select('id, title, image_path, deep_link, sort_order')
      .eq('placement', 'home_carousel')
      .order('sort_order'),
    supabase.from('home_sections').select('id, type, title, sort_order').order('sort_order'),
    supabase.from('store_config').select('business').eq('id', 'default').maybeSingle(),
  ]);

  if (bannersRes.error) throw bannersRes.error;
  if (sectionsRes.error) throw sectionsRes.error;
  if (configRes.error) throw configRes.error;

  const business = configRes.data?.business;
  return {
    banners: bannersRes.data.map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: publicImageUrl('banners', b.image_path),
      deepLink: b.deep_link,
    })),
    sections: sectionsRes.data.map((s) => ({
      id: s.id,
      type: s.type as HomeSectionType,
      title: s.title,
    })),
    settings: {
      freeDeliveryThresholdPaise:
        readNumber(business, ['delivery', 'freeDeliveryThresholdPaise']) ??
        DEFAULT_SETTINGS.freeDeliveryThresholdPaise,
      deliveryFeePaise:
        readNumber(business, ['delivery', 'defaultDeliveryFeePaise']) ??
        DEFAULT_SETTINGS.deliveryFeePaise,
      pointsEarnRupeesPerPoint:
        readNumber(business, ['points', 'earnRupeesPerPoint']) ??
        DEFAULT_SETTINGS.pointsEarnRupeesPerPoint,
    },
  };
}

export const homeQueryKey = ['home'] as const;

export function useHome() {
  return useQuery({ queryKey: homeQueryKey, queryFn: fetchHome, staleTime: 5 * 60_000 });
}

/** Store settings (free-delivery threshold etc.) with safe defaults while loading. */
export function useStoreSettings(): StoreSettings {
  const { data } = useHome();
  return data?.settings ?? DEFAULT_SETTINGS;
}
