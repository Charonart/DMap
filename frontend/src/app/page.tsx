'use client';
import { MapBox } from "@/components/map/MapBox";
import { POIMarkerLayer } from "@/components/map/POIMarkerLayer";
import { MapControls } from "@/components/map/MapControls";
import { MapProvider } from "@/components/map/MapContext";
import { GeolocationTracker } from "@/components/map/GeolocationTracker";
import { FloatingHeader } from "@/components/layout/FloatingHeader";
import { SmartSearchBar } from "@/components/filters/SmartSearchBar";
import { CategoryRow } from "@/components/filters/CategoryRow";
import { A11yFilterDrawer } from "@/components/filters/A11yFilterDrawer";
import { POIDetailSheet } from "@/components/poi/POIDetailSheet";
import { CreatePOISheet } from "@/components/poi/CreatePOISheet";
import { ProfileOverlay } from "@/components/profile/ProfileOverlay";
import { MapContextMenu } from "@/components/map/MapContextMenu";
import { AIChatWidget } from "@/components/ai/AIChatPanel";
import styles from "./page.module.scss";

export default function MapPage() {
  return (
    <main className={styles.mainArea}>
      <MapProvider>
        {/* Layer 1: The Interactive Map */}
        <MapBox>
          <POIMarkerLayer />
          <GeolocationTracker />
        </MapBox>

        {/* Layer 1.5: Right Click Menu */}
        <MapContextMenu />

        {/* Layer 2: On-Map Navigation Controls */}
        <MapControls />

        {/* Layer 3: Top Navigation, Search & Categories Row */}
        <div className={styles.topLayer}>
          <FloatingHeader>
            <div className={styles.searchContainer}>
              <div className={styles.searchInputs}>
                <SmartSearchBar />
                <A11yFilterDrawer />
              </div>
              
              {/* Bottom Row: Scrollable Categories (Full Width) - now inline on desktop */}
              <div className={styles.desktopCategoriesDesktop}>
                <CategoryRow />
              </div>
            </div>
          </FloatingHeader>
        </div>

        {/* Categories on mobile (wrapped under search bar) */}
        <div className={styles.mobileCategories}>
          <CategoryRow />
        </div>

        {/* Layer 5: Detail Overlays (Popups when clicking markers) */}
        <POIDetailSheet />
        <CreatePOISheet />

        {/* Layer 5.5: AI Chat Assistant */}
        <AIChatWidget />

        {/* Layer 6: Global Profile Overlay (Covers the whole map when open) */}
        <ProfileOverlay />
      </MapProvider>
    </main>
  );
}
