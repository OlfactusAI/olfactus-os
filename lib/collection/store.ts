import type { CollectionItem } from "@/lib/domain/collection";

export type CollectionSort = "name" | "rating" | "wears" | "last-worn";

export interface CollectionState {
  items: CollectionItem[];
}

export type CollectionAction =
  | { type: "hydrate"; items: CollectionItem[] }
  | { type: "add"; fragranceId: string }
  | { type: "remove"; fragranceId: string }
  | { type: "log-wear"; fragranceId: string }
  | { type: "toggle-favorite"; fragranceId: string }
  | { type: "update"; fragranceId: string; patch: Partial<Omit<CollectionItem, "fragranceId">> }
  | { type: "reset"; items: CollectionItem[] };

export function collectionReducer(state: CollectionState, action: CollectionAction): CollectionState {
  switch (action.type) {
    case "hydrate":
    case "reset":
      return { items: action.items };
    case "add": {
      if (state.items.some((item) => item.fragranceId === action.fragranceId)) return state;
      return {
        items: [
          ...state.items,
          {
            fragranceId: action.fragranceId,
            wearCount: 0,
            daysSinceLastWear: 0,
            personalRating: 0,
            bottleSizeMl: 100,
            fillLevelPercent: 100,
            favorite: false,
          },
        ],
      };
    }
    case "remove":
      return { items: state.items.filter((item) => item.fragranceId !== action.fragranceId) };
    case "log-wear":
      return {
        items: state.items.map((item) =>
          item.fragranceId === action.fragranceId
            ? { ...item, wearCount: item.wearCount + 1, daysSinceLastWear: 0 }
            : item,
        ),
      };
    case "toggle-favorite":
      return {
        items: state.items.map((item) =>
          item.fragranceId === action.fragranceId ? { ...item, favorite: !item.favorite } : item,
        ),
      };
    case "update":
      return {
        items: state.items.map((item) =>
          item.fragranceId === action.fragranceId ? { ...item, ...action.patch } : item,
        ),
      };
    default:
      return state;
  }
}
