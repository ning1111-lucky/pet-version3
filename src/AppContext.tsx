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

const STORAGE_VERSION = "melody-pet-v4";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const savedVersion = localStorage.getItem("STORAGE_VERSION");
      if (savedVersion !== STORAGE_VERSION) {
        localStorage.removeItem("melody_app_state");
        localStorage.setItem("STORAGE_VERSION", STORAGE_VERSION);
      } else {
        const stored = localStorage.getItem("melody_app_state");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!parsed || typeof parsed !== 'object') {
            throw new Error("Invalid parsed data");
          }
          
          if (!parsed.currentWeekItems || !Array.isArray(parsed.currentWeekItems) || parsed.currentWeekItems.length !== 7) {
            parsed.currentWeekItems = INITIAL_ITEMS;
          }
          
          // Fix logic: cap currentMockDay between 1 and 7
          if (typeof parsed.currentMockDay !== 'number' || parsed.currentMockDay > 7 || parsed.currentMockDay < 1) {
             parsed.currentMockDay = 1;
          }

          if (!parsed.mapEntries || !Array.isArray(parsed.mapEntries)) {
            parsed.mapEntries = [];
          } else {
             parsed.mapEntries = parsed.mapEntries.filter((e: MapEntry) => !MOCK_MAP_ENTRIES.some(m => m.id === e?.id));
          }
          
          return {
            ...parsed,
            userProfile: parsed.userProfile || null,
            dailyHistory: Array.isArray(parsed.dailyHistory) ? parsed.dailyHistory : [],
            weeklyPets: Array.isArray(parsed.weeklyPets) ? parsed.weeklyPets : []
          };
        }
      }
    } catch (e) {
      console.warn("Invalid localStorage, resetting state.", e);
      localStorage.removeItem("melody_app_state");
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
    const { normalizeGenre } = await import("./views/TodayView");
    
    // generate 6 days randomly
    const newItems = [...INITIAL_ITEMS];
    
    for (let i = 0; i < 6; i++) { // Days 1 to 6
      const dailyData = await getTodayMusicData("mock");
      let genre = dailyData.assetGenre || dailyData.mainGenre;
      if (genre === "Mixed" || genre === "Hidden") {
         genre = "Pop"; // Safe fallback
      }
      genre = normalizeGenre(genre);
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

