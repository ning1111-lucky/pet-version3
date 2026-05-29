/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { AppProvider, useApp } from "./AppContext";
import { LoginView } from "./views/LoginView";
import { TodayView } from "./views/TodayView";
import { CollectionView } from "./views/CollectionView";
import { MapView } from "./views/MapView";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-[430px] mx-auto min-h-[100dvh] bg-[var(--color-cream)] flex flex-col items-center justify-center p-8 page-wrapper text-center">
           <div className="border-4 border-[var(--color-brown)] bg-white p-6 rounded-xl shadow-[4px_4px_0_var(--color-caramel)] max-w-full">
             <div className="text-4xl mb-4">💥</div>
             <h2 className="text-xl font-bold text-[var(--color-brown)] mb-2">頁面資料有點混亂</h2>
             <p className="text-xs font-bold text-gray-500 mb-6">點擊下方按鈕重置測試資料。</p>
             
             {this.state.error && (
                <div className="mb-4 text-left p-2 bg-red-50 text-red-800 text-[10px] rounded overflow-auto max-h-32 border border-red-200">
                  <div className="font-bold">{this.state.error.message}</div>
                  <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                </div>
             )}

             <button
               className="pixel-button w-full px-4 py-3 font-bold"
               onClick={() => {
                 localStorage.clear();
                 sessionStorage.clear();
                 window.location.reload();
               }}
             >
               重置並重新開始
             </button>
           </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const BottomNavIcon = ({ type, active }: { type: string, active: boolean }) => {
  const color = active ? "var(--color-cream)" : "var(--color-brown)";
  const bg = active ? "var(--color-caramel)" : "var(--color-cream)";
  const shadow = active ? "none" : "2px 2px 0 var(--color-brown)";
  const transform = active ? "translateY(2px)" : "none";

  const NoteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: "crispEdges" }}>
      <rect x="5" y="11" width="5" height="4" />
      <rect x="8" y="4" width="2" height="7" />
      <rect x="8" y="3" width="7" height="2" />
      <rect x="14" y="4" width="2" height="3" />
    </svg>
  );

  const BoxIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="2" stroke={color} xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: "crispEdges" }}>
      <rect x="6" y="5" width="8" height="3" fill="transparent" />
      <rect x="4" y="8" width="12" height="7" fill="transparent" />
      <rect x="9" y="8" width="2" height="3" fill={color} />
    </svg>
  );

  const MapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="2" stroke={color} xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: "crispEdges" }}>
      <rect x="3" y="4" width="14" height="12" fill="transparent" />
      <line x1="8" y1="4" x2="8" y2="16" strokeDasharray="2 2" />
      <line x1="13" y1="4" x2="13" y2="16" strokeDasharray="2 2" />
      <rect x="5" y="8" width="2" height="2" fill={color} stroke="none" />
    </svg>
  );

  const BookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="2" stroke={color} xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: "crispEdges" }}>
      <rect x="4" y="3" width="12" height="14" fill="transparent" />
      <rect x="5" y="3" width="2" height="14" fill={color} stroke="none" />
      <rect x="10" y="6" width="3" height="2" fill={color} stroke="none" />
    </svg>
  );

  return (
    <div style={{ backgroundColor: bg, boxShadow: shadow, transform: transform }}
         className="w-10 h-10 border-[2px] border-[var(--color-brown)] flex items-center justify-center rounded-[8px] transition-all">
      {type === "today" && <NoteIcon />}
      {type === "items" && <BoxIcon />}
      {type === "map" && <MapIcon />}
      {type === "pokedex" && <BookIcon />}
    </div>
  );
};

const PixelHeader = () => (
  <header className="pixel-header">
    <div className="logo-chip">♪</div>
    <div>
      <h1>Melody Pet Map</h1>
      <p>音樂寵物地圖</p>
    </div>
    <div className="logo-chip">✦</div>
  </header>
);

const AppContent: React.FC = () => {
  const { userProfile } = useApp();
  const [activeTab, setActiveTab] = useState("Today");
  
  // Enforce valid tabs
  const validTabs = ["Today", "Items", "Map"];
  const currentTab = validTabs.includes(activeTab) ? activeTab : "Today";

  if (!userProfile) {
    return <LoginView />;
  }

  return (
    <div className="page-wrapper w-full max-w-[430px] mx-auto min-h-[100dvh] relative flex flex-col shadow-2xl overflow-x-hidden">
       {/* Pixel Header */}
       <PixelHeader />
       
       {/* Main Content Area */}
       <div className="flex-1 overflow-y-auto pb-24">
         {currentTab === "Today" && <TodayView navigateTo={setActiveTab} />}
         {currentTab === "Items" && <CollectionView navigateTo={setActiveTab} />}
         {currentTab === "Map" && <MapView />}
       </div>

       {/* Bottom Navigation */}
       <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--color-sand)] border-t-[3px] border-[var(--color-brown)] rounded-t-xl z-50 flex items-center py-3 pb-8">
          <button onClick={() => setActiveTab("Today")} className="flex-1 flex flex-col items-center">
             <BottomNavIcon type="today" active={currentTab === "Today"} />
             <span className="text-[10px] font-bold mt-1 text-[var(--color-brown)]">今日</span>
          </button>
          <button onClick={() => setActiveTab("Items")} className="flex-1 flex flex-col items-center">
             <BottomNavIcon type="items" active={currentTab === "Items"} />
             <span className="text-[10px] font-bold mt-1 text-[var(--color-brown)]">物品</span>
          </button>
          <button onClick={() => setActiveTab("Map")} className="flex-1 flex flex-col items-center">
             <BottomNavIcon type="map" active={currentTab === "Map"} />
             <span className="text-[10px] font-bold mt-1 text-[var(--color-brown)]">世界地圖</span>
          </button>
       </nav>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
