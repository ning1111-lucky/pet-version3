import React, { useState } from "react";
import { useApp } from "../AppContext";
import { PetPlaceholder } from "../components/UI";
import { MapEntry } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_MAP_ENTRIES } from "../mockData";

export const MapView: React.FC = () => {
  const { mapEntries } = useApp();
  const [selectedEntry, setSelectedEntry] = useState<MapEntry | null>(null);

  // Combine user entries and mock entries
  const allEntriesRaw = [...MOCK_MAP_ENTRIES, ...mapEntries];
  
  const allEntries = allEntriesRaw.map(entry => ({
    id: entry.id || crypto.randomUUID(),
    ownerName: entry.ownerName || "Guest",
    city: entry.city || "Unknown",
    country: entry.country || "",
    top: entry.top || 50,
    left: entry.left || 50,
    pet: entry.pet ? {
      name: entry.pet.name || "未命名音樂寵物",
      mainGenre: entry.pet.mainGenre || "Pop",
      subGenre: entry.pet.subGenre || "Pop",
      baseType: entry.pet.baseType || "O",
      items: Array.isArray(entry.pet.items) ? entry.pet.items : [],
      description: entry.pet.description || ""
    } : {
      name: "未知寵物",
      mainGenre: "Pop",
      subGenre: "Pop",
      baseType: "O",
      items: [],
      description: ""
    }
  }));

  // Stats calculation
  const totalPets = allEntries.length;
  const genreCounts = allEntries.reduce((acc, entry) => {
     const genre = entry.pet?.mainGenre || "Pop";
     acc[genre] = (acc[genre] || 0) + 1;
     return acc;
  }, {} as Record<string, number>);
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
  const latestCity = allEntries[allEntries.length - 1]?.city || "未知";

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-xl font-bold bg-white inline-block px-2 border-2 border-[var(--color-brown)] rounded-md shadow-sm mb-2">世界音樂寵物地圖</h2>
        <p className="text-sm opacity-80 font-bold bg-white inline-block px-1 rounded shadow-sm border border-[var(--color-brown)]">看看大家本週的音樂寵物出現在世界哪裡。</p>
      </div>

      <div className="relative w-full h-[400px] bg-[#E0F2FE] border-[3px] border-[var(--color-brown)] rounded-2xl overflow-hidden shadow-[4px_4px_0_var(--color-caramel)]" style={{ backgroundImage: "radial-gradient(#BAE6FD 2px, transparent 0)", backgroundSize: "16px 16px" }}>
        
        {/* World Map Continents (Abstract Pixel Style) */}
        <div className="absolute top-[15%] left-[8%] w-[35%] h-[40%] bg-[var(--color-sand)] rounded-2xl border-2 border-[var(--color-brown)] opacity-90" /> {/* North America */}
        <div className="absolute top-[55%] left-[18%] w-[20%] h-[35%] bg-[var(--color-sand)] rounded-2xl border-2 border-[var(--color-brown)] opacity-90" /> {/* South America */}
        <div className="absolute top-[10%] left-[45%] w-[45%] h-[35%] bg-[var(--color-sand)] rounded-[24px] border-2 border-[var(--color-brown)] opacity-90" /> {/* Eurasia */}
        <div className="absolute top-[45%] left-[42%] w-[25%] h-[35%] bg-[var(--color-sand)] rounded-[20px] border-2 border-[var(--color-brown)] opacity-90" /> {/* Africa */}
        <div className="absolute top-[65%] left-[72%] w-[18%] h-[20%] bg-[var(--color-sand)] rounded-xl border-2 border-[var(--color-brown)] opacity-90" /> {/* Australia */}

        {/* Pins */}
        {allEntries.map(entry => (
          <motion.div
             key={entry.id}
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ type: "spring", bounce: 0.5 }}
             className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-[100%]"
             style={{ top: `${entry.top}%`, left: `${entry.left}%` }}
             onClick={() => setSelectedEntry(entry)}
          >
            <div className="relative group shadow-[2px_2px_0_var(--color-brown)]">
               <div className="bg-[var(--color-cream)] border-2 border-[var(--color-brown)] p-1 rounded-md hover:bg-[var(--color-caramel)] transition-colors">
                 <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center border border-[var(--color-brown)]">
                    <PetPlaceholder baseType={entry.pet.baseType} className="w-6 h-6" />
                 </div>
               </div>
               
               {/* Location label */}
               <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[var(--color-sand)] text-[10px] border-2 border-[var(--color-brown)] px-1 font-bold whitespace-nowrap z-20 rounded-sm">
                 {entry.city}
               </div>

               {/* Pin pointing down */}
               <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-brown)] rotate-45 z-0" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-3 gap-2">
         <div className="bg-[var(--color-cream)] border-2 border-[var(--color-brown)] p-2 rounded-lg text-center shadow-[2px_2px_0_var(--color-caramel)]">
             <div className="text-[10px] font-bold text-[var(--color-brown)] opacity-80">世界寵物數</div>
             <div className="text-lg font-bold">{totalPets}</div>
         </div>
         <div className="bg-[var(--color-cream)] border-2 border-[var(--color-brown)] p-2 rounded-lg text-center shadow-[2px_2px_0_var(--color-caramel)]">
             <div className="text-[10px] font-bold text-[var(--color-brown)] opacity-80">熱門風格</div>
             <div className="text-[14px] font-bold mt-1 line-clamp-1">{topGenre}</div>
         </div>
         <div className="bg-[var(--color-cream)] border-2 border-[var(--color-brown)] p-2 rounded-lg text-center shadow-[2px_2px_0_var(--color-caramel)]">
             <div className="text-[10px] font-bold text-[var(--color-brown)] opacity-80">最新城市</div>
             <div className="text-[14px] font-bold mt-1 line-clamp-1">{latestCity}</div>
         </div>
      </div>

      {/* Bottom Sheet / Modal for selected pet */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
             initial={{ y: "100%", opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: "100%", opacity: 0 }}
             className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-[var(--color-card)] border-t-4 border-[var(--color-brown)] rounded-t-3xl shadow-[0_-4px_0_rgba(0,0,0,0.1)] pb-12 pt-6 px-6"
             style={{ maxHeight: '80vh', overflowY: 'auto' }}
          >
             <button
               className="absolute top-4 right-4 font-bold text-xl px-2 bg-[var(--color-cream)] border-2 border-[var(--color-brown)] rounded-md shadow-[2px_2px_0_var(--color-brown)] text-[var(--color-brown)] active:scale-95"
               onClick={() => setSelectedEntry(null)}
             >
               ×
             </button>
             
             <div className="flex flex-col items-center">
                <div className="text-sm font-bold text-[var(--color-cream)] bg-[var(--color-brown)] px-3 py-1 rounded-full mb-4">
                  📍 {selectedEntry.city}, {selectedEntry.country}
                </div>
                
                <div className="bg-white p-4 border-2 border-[var(--color-brown)] border-dashed rounded-xl mb-4">
                   <PetPlaceholder baseType={selectedEntry.pet.baseType} className="w-32 h-32" />
                </div>
                
                <h3 className="font-bold text-2xl text-[var(--color-brown)] mb-1 bg-[--color-cream] px-2 rounded">{selectedEntry.pet.name}</h3>
                <div className="text-sm font-bold text-[var(--color-caramel)] mb-4 bg-white px-2 rounded-sm border border-[var(--color-brown)]">Owner: {selectedEntry.ownerName}</div>
                
                <div className="flex space-x-2 text-sm mb-4 font-bold">
                   <div className="bg-[var(--color-sand)] border-2 border-[var(--color-brown)] px-3 py-1 rounded-md shadow-sm">主風格: {selectedEntry.pet.mainGenre}</div>
                   <div className="bg-[var(--color-sand)] border-2 border-[var(--color-brown)] px-3 py-1 rounded-md shadow-sm">次風格: {selectedEntry.pet.subGenre}</div>
                </div>

                <div className="text-sm font-bold opacity-80 mb-4 px-4 text-center bg-white py-2 rounded-md border border-gray-200 w-full">"{selectedEntry.pet.description}"</div>
                
                <div className="w-full text-left font-bold text-sm mb-2 text-[var(--color-brown)] border-b-2 border-dashed border-[var(--color-brown)] pb-1">本週收集物品</div>
                <div className="flex flex-wrap gap-2 justify-start w-full bg-[var(--color-cream)] p-2 rounded-md border-2 border-[var(--color-brown)]">
                   {selectedEntry.pet.items && selectedEntry.pet.items.length > 0 ? (
                     selectedEntry.pet.items.map(item => (
                       <div key={item.id} className="w-10 h-10 rounded-sm border-2 border-[var(--color-brown)] flex items-center justify-center text-xl bg-white" title={item.genre + ' ' + item.part}>
                         {item.icon}
                       </div>
                     ))
                   ) : (
                     <span className="text-xs text-gray-500 font-bold p-2">沒有穿戴物品</span>
                   )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
