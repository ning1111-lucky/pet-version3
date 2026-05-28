import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, MusicItem, Pet, MapEntry } from "./types";
import { MOCK_MAP_ENTRIES } from "./mockData";

interface AppState {
  userProfile: UserProfile | null;
  currentMockDay: number;
  currentWeekItems: (MusicItem | null)[];
  dailyHistory: MusicItem[];
  weeklyPets: Pet[];
  mapEntries: MapEntry[];
}

interface AppContextType extends AppState {
  login: (profile: UserProfile) => void;
  generateItem: (item: MusicItem) => void;
  advanceDay: () => void;
  generateWeeklyPet: (pet: Pet) => void;
  resetWeek: () => void;
  addToMap: (entry: MapEntry) => void;
  autoFillWeek: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ITEMS = Array(7).fill(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem("melody_app_state");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure items array is always length 7
        if (!parsed.currentWeekItems || parsed.currentWeekItems.length !== 7) {
          parsed.currentWeekItems = INITIAL_ITEMS;
        }
        if (!parsed.mapEntries) {
          parsed.mapEntries = [];
        } else {
           // Filter out mock entries if any accidentally got into local storage previously
           parsed.mapEntries = parsed.mapEntries.filter((e: MapEntry) => !MOCK_MAP_ENTRIES.some(m => m.id === e.id));
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return {
      userProfile: null,
      currentMockDay: 1, // 1 to 7
      currentWeekItems: INITIAL_ITEMS,
      dailyHistory: [],
      weeklyPets: [],
      mapEntries: [],
    };
  });

  useEffect(() => {
    localStorage.setItem("melody_app_state", JSON.stringify(state));
  }, [state]);

  const login = (profile: UserProfile) => {
    setState((s) => ({ ...s, userProfile: profile }));
  };

  const generateItem = (item: MusicItem) => {
    setState((s) => {
      const newItems = [...s.currentWeekItems];
      newItems[s.currentMockDay - 1] = item;
      return {
        ...s,
        currentWeekItems: newItems,
        dailyHistory: [...s.dailyHistory, item],
      };
    });
  };

  const advanceDay = () => {
    setState((s) => ({ ...s, currentMockDay: Math.min(s.currentMockDay + 1, 7) }));
  };

  const generateWeeklyPet = (pet: Pet) => {
    setState((s) => ({ ...s, weeklyPets: [...s.weeklyPets, pet] }));
  };

  const resetWeek = () => {
    setState((s) => ({
      ...s,
      currentMockDay: 1,
      currentWeekItems: INITIAL_ITEMS,
    }));
  };

  const autoFillWeek = async () => {
    const { getTodayMusicData, getDailyPart } = await import("./mockData");
    const { assetMap } = await import("./assetMap");
    
    // generate 6 days randomly
    const newItems = [...INITIAL_ITEMS];
    
    for (let i = 0; i < 6; i++) { // Days 1 to 6
      const dailyData = await getTodayMusicData("mock");
      const genre = dailyData.assetGenre || dailyData.mainGenre;
      const part = getDailyPart(i + 1);
      
      newItems[i] = {
        id: Math.random().toString(36).substring(2),
        day: i + 1,
        part: part,
        genre: genre as any,
        label: `${genre} ${part}`,
        icon: "✨",
        imageSrc: assetMap[genre]?.[part] || null
      };
    }
    
    // Day 7 is just null intentionally since it represents the final assembly day
    // We update state after generation
    setState(s => ({ ...s, currentMockDay: 7, currentWeekItems: newItems }));
  };

  const addToMap = (entry: MapEntry) => {
    setState((s) => ({ ...s, mapEntries: [...s.mapEntries, entry] }));
  };

  return (
    <AppContext.Provider value={{ ...state, login, generateItem, advanceDay, generateWeeklyPet, resetWeek, addToMap, autoFillWeek }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

