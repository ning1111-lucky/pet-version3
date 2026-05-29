import React, { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { Card, Button, PixelItemPlaceholder } from "../components/UI";
import { getDailyPart, getTodayMusicData, MUSIC_PROVIDER } from "../mockData";
import { DailyMusicData, MusicItem, ItemPart, Genre, MapEntry, Pet } from "../types";
import { generateId, cn } from "../utils";
import { motion } from "motion/react";
import { assetMap, baseShapeMap, genreToBaseType } from "../assetMap";

export function normalizeGenre(genre: string): string {
  const map: Record<string, string> = {
    "K-pop": "Kpop", "Kpop": "Kpop", "KPOP": "Kpop", "kpop": "Kpop",
    "Pop": "Pop", "POP": "Pop", "pop": "Pop",
    "R&B": "RnB", "RnB": "RnB", "RNB": "RnB", "rnb": "RnB",
    "Rock": "Rock", "ROCK": "Rock", "rock": "Rock",
    "Jazz": "Jazz", "JAZZ": "Jazz", "jazz": "Jazz",
    "Indie": "Indie", "Taiwan Indie": "Indie", "INDIE": "Indie", "indie": "Indie",
    "Hip-hop": "Hiphop", "Hiphop": "Hiphop", "HIPHOP": "Hiphop", "hiphop": "Hiphop",
    "Classical": "Classical", "CLASSICAL": "Classical", "classical": "Classical",
    "Country": "Country", "COUNTRY": "Country", "country": "Country",
    "EDM": "EDM", "edm": "EDM"
  };
  return map[genre] || genre;
}

export const TodayView: React.FC<{ navigateTo: (tab: string) => void }> = ({ navigateTo }) => {
  const { currentMockDay, currentWeekItems, generateItem, advanceDay, resetWeek, weeklyPets, generateWeeklyPet, addToMap, autoFillWeek, userProfile } = useApp();
  
  const [mockMusic, setMockMusic] = useState<DailyMusicData | null>(null);
  const [showGenAnim, setShowGenAnim] = useState(false);
  const [confirmedGenre, setConfirmedGenre] = useState<Genre | null>(null);

  useEffect(() => {
    let active = true;
    setConfirmedGenre(null);
    setShowGenAnim(false);
    getTodayMusicData(MUSIC_PROVIDER).then(data => {
      if (active) {
        setMockMusic(data);
        setConfirmedGenre((data.assetGenre || data.mainGenre) as Genre);
      }
    });
    return () => { active = false; };
  }, [currentMockDay]); // Refetch music data when day changes

  const isFinalPetDay = currentMockDay === 7;
  const safeItems = Array.isArray(currentWeekItems) ? currentWeekItems : [];
  const hasGeneratedToday = isFinalPetDay ? true : !!safeItems[currentMockDay - 1]; 

  const targetPart = getDailyPart(currentMockDay);
  const targetGenre = confirmedGenre || mockMusic?.assetGenre || mockMusic?.mainGenre || "Pop";
  const normalizedTargetGenre = normalizeGenre(targetGenre as string);
  const targetImageSrc = isFinalPetDay ? null : (assetMap[normalizedTargetGenre]?.[targetPart] || null);

  const handleGenerate = () => {
    if (!confirmedGenre) return;
    setShowGenAnim(true);
    setTimeout(() => {
      const newItem: MusicItem = {
        id: generateId(),
        day: currentMockDay,
        part: targetPart,
        genre: normalizedTargetGenre as Genre,
        label: `${normalizedTargetGenre} ${targetPart}`,
        icon: "✨",
        imageSrc: targetImageSrc
      };
      generateItem(newItem);
    }, 600);
  };

  const handleAdvanceDay = () => {
     advanceDay();
  };

  const currentItem = safeItems[currentMockDay - 1];

  // Logic for Day 7 (Weekly Pet)
  const collectedItems = safeItems.slice(0, 6).filter(item => item && item.genre && item.part && item.imageSrc) as MusicItem[];
  const isComplete = collectedItems.length === 6;

  const genreCounts: Record<string, number> = {};
  if (isComplete) {
    collectedItems.forEach(item => {
      genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
    });
  }

  let mainGenre: Genre = (isComplete ? (collectedItems[0]?.genre || "Pop") : "Pop") as Genre;
  let subGenre: Genre = "Pop";
  
  if (isComplete) {
    let maxCount = 0;
    Object.entries(genreCounts).forEach(([g, c]) => {
      if (c > maxCount) {
        maxCount = c;
        mainGenre = g as Genre;
      }
    });
    // Find sub genre (second highest)
    let subMaxCount = 0;
    Object.entries(genreCounts).forEach(([g, c]) => {
      if (g !== mainGenre && c > subMaxCount) {
        subMaxCount = c;
        subGenre = g as Genre;
      }
    });

    if (Object.keys(genreCounts).length === 1) {
      subGenre = mainGenre; // Only one genre present
    }
  }

  const baseType = genreToBaseType[mainGenre as string] || "base-1";
  const baseImageSrc = baseShapeMap[baseType] || null;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImgErr, setGeneratedImgErr] = useState<string | null>(null);

  const [imgLoading, setImgLoading] = useState(false);
  const [imgLoadError, setImgLoadError] = useState(false);

  const [generatedPetImage, setGeneratedPetImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem("generatedWeeklyPetImage");
    } catch {
      return null;
    }
  });

  const buildDay7FinalPetPrompt = (
    weekItems: MusicItem[],
    mainGenreStr: string,
    secondGenreStr: string,
    baseTypeStr: string
  ) => {
    if (weekItems.length < 6) return null;

    const safeGenre = (part: string) => {
      const item = weekItems.find(i => i?.part === part);
      return item?.genre || "Unknown genre";
    };

    const clothesGenre = safeGenre("clothes");
    const headwearGenre = safeGenre("headwear");
    const accessoryGenre = safeGenre("accessory");
    const handheldGenre = safeGenre("handheld");
    const shoesGenre = safeGenre("shoes");
    const enhanceGenre = safeGenre("enhance");

    return `Create a complete weekly music pet character based on the user's collected music items.

Visual style:
soft pixel art, warm creamy colors, dark brown outlines, cute collectible creature, music pet encyclopedia style, cozy old browser game feeling, polished and delicate pixel illustration, low saturation pastel palette.

Character base:
a cute cream-white pet with a large round head, tiny dot eyes, small curved mouth, soft blush cheeks, short arms and short legs. The pet should feel like a collectible music creature.

Weekly music identity:
Main genre: ${mainGenreStr}
Secondary genre: ${secondGenreStr}
Base type: ${baseTypeStr}

Collected weekly items:
Day 1 clothes: ${clothesGenre} inspired clothing
Day 2 headwear: ${headwearGenre} inspired headwear
Day 3 accessory: ${accessoryGenre} inspired accessory
Day 4 handheld: ${handheldGenre} inspired handheld object
Day 5 shoes: ${shoesGenre} inspired shoes
Day 6 enhancement: ${enhanceGenre} inspired small magical music effect

Design requirement:
Please merge all six collected items into one harmonious final pet design.
The items should look naturally worn by the pet, not floating separately.
The pet should look like a finished character from a cute online pet game.
Keep the silhouette clear and readable.
Do not overcrowd the design.
Do not cover the face.
Make the accessories visible but balanced.
Use dark brown outlines instead of black.
Use a warm cream background or transparent background.
No realistic rendering.
No 3D.
No modern SaaS style.
No text labels.
No watermark.

Output:
one complete full-body music pet character, centered, front view, pixel art style.`;
  };

  const day7Prompt = isComplete ? buildDay7FinalPetPrompt(collectedItems, mainGenre, subGenre, baseType) : null;

  const generateWeeklyPetImage = async () => {
    if (!day7Prompt) {
       setGeneratedImgErr("尚未產生本週寵物提示詞。");
       return;
    }
    
    if (generatedPetImage) {
      if (!window.confirm("重新生成會覆蓋目前圖片，確定嗎？")) {
        return;
      }
    }

    setIsGenerating(true);
    setGeneratedImgErr(null);
    setImgLoading(true);
    setImgLoadError(false);

    try {
      const res = await fetch("/api/generate-weekly-pet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: day7Prompt })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "圖片生成服務暫時無法使用，請稍後再試。");
      }
      setGeneratedPetImage(data.imageUrl);
      localStorage.setItem("generatedWeeklyPetImage", data.imageUrl);
    } catch(err: any) {
      setGeneratedImgErr(err.message || "圖片生成服務暫時無法使用，請稍後再試。");
      setImgLoading(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployToMap = () => {
    if (!isComplete) return;
    const petId = generateId();
    const newPet: Pet = {
      id: petId,
      name: `${mainGenre} 音樂精靈`,
      description: `由本週的音樂行程誕生，充滿 ${mainGenre} 的氣息。`,
      mainGenre: mainGenre,
      subGenre: subGenre,
      baseType: baseType as "O" | "G" | "B",
      items: collectedItems,
      weekNumber: 1
    };
    generateWeeklyPet(newPet);
    
    // Instructions: "mapEntry 請優先保存 generatedPetImage"
    const mapEntry: any = {
       id: generateId(),
       petId: petId,
       pet: newPet,
       ownerName: userProfile?.name || "Guest",
       country: userProfile?.country || "Earth",
       city: userProfile?.city || "Unknown City",
       top: 50 + (Math.random() - 0.5) * 40, 
       left: 50 + (Math.random() - 0.5) * 40,
       petImage: generatedPetImage || null,
       provider: "pollinations"
    };
    addToMap(mapEntry);
    localStorage.removeItem("generatedWeeklyPetImage");
    setGeneratedPetImage(null);
    resetWeek();
    navigateTo("Map");
  };

  if (!mockMusic && !isFinalPetDay) {
    return <div className="p-8 text-center text-sm font-bold">加載今日音樂數據...</div>;
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-xl font-bold bg-white inline-block px-2 border-2 border-[var(--color-brown)] rounded-md shadow-sm mb-2">{isFinalPetDay ? "本週音樂寵物完成" : "今日音樂分析"}</h2>
        <div className="flex items-center justify-center space-x-2">
           <span className="text-xs bg-[var(--color-sand)] px-1 pixel-border border border-[var(--color-brown)]">Day {currentMockDay}/7</span>
           <span className="text-[10px] text-gray-500 italic">Data Source: {MUSIC_PROVIDER.toUpperCase()}</span>
        </div>
      </div>

      {!isFinalPetDay && mockMusic && (
        <Card className="flex flex-col space-y-4 shadow-sm border-2 border-[var(--color-brown)]">
          <div className="text-center font-bold text-lg mb-2 relative">
             🎶 聆聽數據 🎶
          </div>
          <div className="flex justify-between items-center border-b-[2px] border-[var(--color-brown)] pb-2 border-dashed">
            <div className="font-bold">聽歌數量</div>
            <div className="text-xl">{mockMusic.songCount} 首</div>
          </div>
          <div className="flex justify-between items-center border-b-[2px] border-[var(--color-brown)] pb-2 border-dashed">
            <div className="font-bold">分析類型</div>
            <div className="text-xl mx-2 bg-[var(--color-sand)] px-2 pixel-border">
              {mockMusic.mainGenre === "Mixed" ? "混合型" : mockMusic.mainGenre === "Hidden" ? "隱藏版" : "純粹型"}
            </div>
          </div>
          <div className="flex justify-between items-center border-b-[2px] border-[var(--color-brown)] pb-2 border-dashed">
            <div className="font-bold">推薦主風格</div>
            <div className="text-xl mx-2">{normalizeGenre(mockMusic.assetGenre as string).toUpperCase()}</div>
          </div>
          <div className="flex justify-between items-center border-b-[2px] border-[var(--color-brown)] pb-2 border-dashed">
            <div className="font-bold">推薦次風格</div>
            <div className="text-xl mx-2">{normalizeGenre(mockMusic.subGenre as string).toUpperCase()}</div>
          </div>

          <div className="pt-2">
            <div className="text-sm font-bold mb-2">音樂風格分佈</div>
            <div className="flex h-4 bg-[var(--color-cream)] pixel-border overflow-hidden">
              {(mockMusic.distribution || []).map((d, i) => (
                <div
                  key={d.genre}
                  className="h-full border-r-2 border-[var(--color-brown)] last:border-r-0 flex items-center justify-center text-[8px] font-bold overflow-hidden whitespace-nowrap text-[var(--color-cream)]"
                  style={{
                    width: `${d.percentage}%`,
                    backgroundColor: i === 0 ? "var(--color-caramel)" : i === 1 ? "var(--color-blush)" : "var(--color-sand)"
                  }}
                >
                  {d.percentage > 10 ? d.genre : ""}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[var(--color-cream)] p-3 pixel-border text-sm italic text-center font-bold">
            "{mockMusic.quote}"
          </div>
        </Card>
      )}

      {!isFinalPetDay && mockMusic && !hasGeneratedToday && (
        <Card className="text-center border-dashed border-4 border-[var(--color-brown)] shadow-sm">
          <h3 className="font-bold mb-4 bg-white inline-block px-2 py-1 rounded shadow-sm border border-[var(--color-brown)]">
            你覺得今天比較像哪種風格？
          </h3>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
             {["KPOP", "POP", "RNB", "ROCK", "JAZZ", "INDIE", "HIPHOP", "CLASSICAL", "COUNTRY", "EDM"].map(g => (
                 <button 
                   key={g} 
                   onClick={() => setConfirmedGenre(g as Genre)}
                   className={cn(
                     "px-2 py-1 rounded-md border-2 text-xs font-bold transition-all",
                     normalizeGenre(confirmedGenre as string).toUpperCase() === g
                       ? "bg-[var(--color-caramel)] border-[var(--color-brown)] text-[var(--color-cream)] shadow-[2px_2px_0_var(--color-brown)] -translate-y-1"
                       : "bg-[var(--color-cream)] border-[var(--color-brown)] text-[var(--color-brown)] opacity-80"
                   )}>
                   {g}
                 </button>
             ))}
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4">
             {showGenAnim ? (
               <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: [0, -10, 0], opacity: 1 }}
                   transition={{ duration: 0.5 }}
                 >
                   <PixelItemPlaceholder genre={normalizeGenre(confirmedGenre as string)} part={targetPart} className="w-24 h-24" />
                 </motion.div>
             ) : (
               <div className="text-sm opacity-60">
                  將生成 {normalizeGenre(confirmedGenre as string)} 的 {targetPart}
               </div>
             )}

             {!showGenAnim && confirmedGenre ? (
                <Button onClick={handleGenerate} className="w-full !py-2 text-sm pixel-button font-bold">
                   確認今日風格並生成物品
                </Button>
             ) : (
                <div className="min-h-[40px]"></div>
             )}
             {!targetImageSrc && !showGenAnim && confirmedGenre && (
                 <div className="text-xs text-red-500 mt-2 font-bold bg-white px-1">缺少素材：{normalizeGenre(confirmedGenre as string)}-{targetPart}</div>
             )}
          </div>
        </Card>
      )}

      {isFinalPetDay && !isComplete && (
        <Card className="text-center border-dashed border-4 border-red-300 shadow-sm">
           <h3 className="text-xl font-bold mb-2 text-red-500">無法生成寵物</h3>
           <p className="text-sm font-bold text-gray-600 mb-6">還需要收集更多物品，才能生成本週音樂寵物。<br />（這通常是因為使用了舊版紀錄或缺乏素材）</p>
           <Button onClick={resetWeek} className="w-full text-lg py-3 pixel-button font-bold">重置並重新開始</Button>
        </Card>
      )}

      {isFinalPetDay && isComplete && (
        <Card className="text-center border-dashed border-4 border-[var(--color-caramel)] shadow-sm">
          <h3 className="text-xl font-bold mb-2">本週音樂寵物生成</h3>
          <p className="text-xs text-gray-600 mb-4 font-bold">系統已根據這週收集的 6 個音樂物品，整理出完整寵物生成提示詞。</p>
          
          <div className="mb-4">
             <div className="font-bold text-lg">{mainGenre} 音樂精靈</div>
             <div className="flex justify-center space-x-2 mt-1">
               <span className="text-xs bg-[var(--color-sand)] px-2 pixel-border">主：{mainGenre}</span>
               <span className="text-xs bg-white border border-gray-300 px-2 pixel-border">副：{subGenre}</span>
             </div>
          </div>

          <div className="grid grid-cols-6 gap-1 mb-4 bg-gray-100 p-2 rounded border-2 border-gray-300">
             {(collectedItems || []).map((item, i) => (
                 <div key={item?.id || i} className="aspect-square bg-white border-2 border-gray-300 flex items-center justify-center p-1 border-dashed">
                    {item?.imageSrc ? (
                       <img src={item.imageSrc} alt={item.part} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                       <span className="text-xs text-red-500 font-bold max-w-[20px] overflow-hidden">缺</span>
                    )}
                 </div>
             ))}
          </div>
          
          <div className="mb-4 text-left">
            <div className="text-xs font-bold mb-1 ml-1 text-[var(--color-brown)]">Day 7 Final Pet Prompt</div>
            <textarea
               className="w-full h-32 px-3 py-2 text-xs text-gray-700 pixel-border border-2 bg-white resize-none"
               readOnly
               value={day7Prompt || ""}
            />
            {day7Prompt && (
              <button
                className="mt-2 text-xs bg-[var(--color-sand)] text-[var(--color-brown)] font-bold px-3 py-1 border-2 border-[var(--color-brown)] rounded-sm active:scale-95 transition-transform"
                onClick={() => navigator.clipboard.writeText(day7Prompt)}
              >
                複製 Prompt
              </button>
            )}
          </div>

          {generatedImgErr && (
            <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 p-2 rounded mb-4">
               {generatedImgErr}
            </div>
          )}

          {generatedPetImage ? (
            <div className="mb-6 flex flex-col items-center">
              <div className="w-48 h-48 border-4 border-dashed border-[var(--color-brown)] rounded-xl bg-white p-2 shadow-[4px_4px_0_var(--color-caramel)] relative overflow-hidden group">
                 {imgLoading && (
                   <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 text-xs font-bold text-gray-500 text-center px-2 border-2 border-dashed border-gray-300">
                     正在載入圖片...
                   </div>
                 )}
                 {imgLoadError && (
                   <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10 text-xs font-bold text-red-500 text-center p-2 border-2 border-dashed border-red-200">
                     圖片暫時載入失敗，請重新生成或稍後再試。
                   </div>
                 )}
                 <img 
                    src={generatedPetImage} 
                    alt="Generated Pet" 
                    className="w-full h-full object-contain relative z-0" 
                    onLoad={() => {
                       setImgLoading(false);
                       setImgLoadError(false);
                    }}
                    onError={() => {
                       setImgLoading(false);
                       setImgLoadError(true);
                    }}
                 />
              </div>
              
              {!imgLoading && !imgLoadError && (
                 <div className="text-xs font-bold text-green-600 mt-2 bg-green-50 px-2 py-1 rounded-sm border border-green-200">生成成功！</div>
              )}

              <div className="mt-4 w-full">
                 <Button 
                    onClick={generateWeeklyPetImage} 
                    className="w-full text-base py-3 pixel-button font-bold text-white bg-blue-500 hover:bg-blue-600 border-blue-700"
                    disabled={isGenerating}
                 >
                    {isGenerating ? "正在生成本週音樂寵物，可能需要幾秒鐘。" : "重新生成本週音樂寵物"}
                 </Button>
              </div>
            </div>
          ) : (
             <div className="mb-4">
                <Button 
                   onClick={generateWeeklyPetImage} 
                   className="w-full text-base py-3 pixel-button font-bold text-white bg-blue-500 hover:bg-blue-600 border-blue-700"
                   disabled={isGenerating}
                >
                   {isGenerating ? "正在生成本週音樂寵物，可能需要幾秒鐘。" : "生成本週音樂寵物"}
                </Button>
             </div>
          )}
          
          <Button onClick={handleDeployToMap} className="w-full text-lg py-3 pixel-button font-bold" disabled={isGenerating && !generatedPetImage}>放到地圖上</Button>
        </Card>
      )}

      {!isFinalPetDay && hasGeneratedToday && (
        <Card className="text-center border-dashed border-4 border-[var(--color-brown)] shadow-sm">
          <h3 className="font-bold mb-4 bg-white inline-block px-2 py-1 rounded shadow-sm border border-gray-200">今日生成目標：{targetPart}</h3>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center space-y-4 min-h-[160px]">
             <PixelItemPlaceholder genre={currentItem?.genre as string || normalizedTargetGenre} part={currentItem?.part || targetPart} label={currentItem?.label} imageSrc={currentItem?.imageSrc} className="w-32 h-32" />
            <div className="text-sm font-bold text-[var(--color-caramel)] bg-white px-2 py-1 rounded shadow-sm border border-[var(--color-brown)]">已收錄至本週收藏</div>
          </motion.div>
        </Card>
      )}

      {/* Dev Tools / Simulator controls per instructions */}
      <div className="pt-4 flex flex-wrap gap-2 justify-center border-t-2 border-[var(--color-brown)] border-dashed mt-8 p-4">
         <div className="w-full text-center text-xs font-bold mb-2">DEV TOOLS</div>
         <Button variant="secondary" onClick={handleAdvanceDay} className="text-xs !p-2 pixel-button shadow-sm" disabled={currentMockDay >= 7}>模擬下一天</Button>
         <Button variant="secondary" onClick={resetWeek} className="text-xs !p-2 pixel-button shadow-sm">重置本週</Button>
         <Button variant="secondary" onClick={autoFillWeek} className="text-xs !p-2 pixel-button shadow-sm opacity-80">一鍵生成一週</Button>
      </div>
    </div>
  );
};
