'use client';
import { FloatingHeader } from "@/components/layout/FloatingHeader";
import { SmartSearchBar } from "@/components/filters/SmartSearchBar";
import { CategoryRow } from "@/components/filters/CategoryRow";
import { A11yFilterDrawer } from "@/components/filters/A11yFilterDrawer";
import { ScoreFilterSlider } from "@/components/filters/ScoreFilterSlider";
import { POIHeaderInfo } from "@/components/poi/POIHeaderInfo";
import { POIPerformanceBreakdown } from "@/components/poi/POIPerformanceBreakdown";
import { POIPinMarker } from "@/components/map/POIPinMarker";
import { UserLocationPulsingDot } from "@/components/map/UserLocationPulsingDot";
import { POIResultCard } from "@/components/poi/POIResultCard";
import { POIActionRow } from "@/components/poi/POIActionRow";
import { ReviewCard } from "@/components/poi/ReviewCard";
import { MapProvider, useMapContext } from "@/components/map/MapContext";

// Dummy POI data for UI testing
const dummyPoi = {
  id: '123',
  name: 'Bệnh viện Quận Thủ Đức (Demo)',
  address: '29 Phú Châu, Tam Phú, Thủ Đức, HCM',
  category_name: 'Y Tế',
  image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&q=80',
  overall_score: 8.5,
  status: 'approved',
  description: 'Bệnh viện có nhiều tiện ích cho người khuyết tật.',
  lat: 10.852,
  lng: 106.745
};

const dummyFeatures = [
  { id: 1, name: 'wheelchair_ramp', name_vi: 'Lối đi cho xe lăn', feature_group: 'Vận động', is_available: true, quality_rating: 8 },
  { id: 2, name: 'elevator', name_vi: 'Thang máy rộng', feature_group: 'Vận động', is_available: true, quality_rating: 6 },
  { id: 3, name: 'braille_signs', name_vi: 'Nhãn nổi Braille', feature_group: 'Thị giác', is_available: true, quality_rating: 4 },
  { id: 4, name: 'tactile_paving', name_vi: 'Lối đi xúc giác', feature_group: 'Thị giác', is_available: false, quality_rating: 0 },
  { id: 5, name: 'accessible_wc', name_vi: 'WC cho người khuyết tật', feature_group: 'Vận động', is_available: true, quality_rating: 9 },
];

const dummyReview = {
  id: 'rev1',
  reviewer_name: 'Nguyen Van A',
  rating: 9,
  comment: 'Đường dốc xe lăn rất dễ đi, tuy nhiên thang máy hơi nhỏ nếu có người nhà đi kèm.',
  disability_type: 'Xe lăn',
  created_at: new Date().toISOString(),
  helpful_count: 14
};

// Fake map component just to satisfy Context
const FakeMap = () => {
  const { setMap } = useMapContext();
  // Using an empty effect to prevent undefined errors
  return <div className="absolute inset-0 bg-surface-dim opacity-50 z-0"></div>;
};

export default function LayoutMapCoreSandbox() {
  return (
    <MapProvider>
      <div className="relative w-full min-h-screen bg-surface-container-lowest overflow-y-auto overflow-x-hidden pb-32 pb-lg-0">
        <FakeMap />
        
        {/* Mock Top UI */}
        <div className="h-[250px] relative w-full border-b-4 border-dashed border-outline/20">
          <p className="absolute bottom-2 right-2 text-label text-on-surface-variant z-0 text-center w-full">Vùng giả lập Bản đồ</p>
          <FloatingHeader>
            <div className="flex gap-2">
              <SmartSearchBar />
              <A11yFilterDrawer />
            </div>
          </FloatingHeader>
          <CategoryRow />
        </div>

        {/* Mock Bottom / Detail UI */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 grid md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-8">
            <section>
              <h2 className="text-h2 mb-4">Các bộ lọc phụ</h2>
              <ScoreFilterSlider />
            </section>

            <section>
              <h2 className="text-h2 mb-4">Danh sách Kết quả Điểm đến (POI List)</h2>
              <div className="bg-surface-container-lowest border border-outline/20 rounded-xl shadow-m3-md overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar">
                <POIResultCard poi={dummyPoi} />
                <POIResultCard poi={{...dummyPoi, name: 'Nhà hàng chay Sen', category_name: 'Nhà Hàng', overall_score: 5, distance_meters: 450, image_url: null}} />
                <POIResultCard poi={{...dummyPoi, name: 'Cà phê Highland Thủ Đức', category_name: 'Cà Phê', overall_score: 3, distance_meters: 1200, image_url: null}} />
              </div>
            </section>

            <section>
              <h2 className="text-h2 mb-4">Mô phỏng Bottom Sheet Nhanh (Không cần load API)</h2>
              <div className="p-4 bg-surface-container-lowest border border-outline rounded-3xl shadow-m3-xl space-y-4">
                <POIHeaderInfo poi={dummyPoi} />
                <POIActionRow poi={dummyPoi} />
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-h2 mb-4">Bản Đồ Hạng Nặng (Marker & GPS)</h2>
              <div className="p-6 bg-surface-container-lowest border border-outline rounded-xl shadow-m3-md space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="p-4 bg-surface-dim border border-dashed border-outline/20 flex flex-col items-center gap-2 overflow-hidden">
                    <span className="text-label text-on-surface-variant mb-4">Toạ độ GPS</span>
                    {/* Bearing 45 degrees to show compass cone clearly */}
                    <div className="transform scale-[0.6]">
                       <UserLocationPulsingDot bearing={45} />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-surface-dim border border-dashed border-outline/20 flex flex-col items-center gap-4 flex-1">
                    <span className="text-label text-on-surface-variant">Ghim DOM Markers</span>
                    <div className="flex gap-4 items-end mt-4">
                      <POIPinMarker score={9.0} category="y tế" />
                      <POIPinMarker score={7.5} category="nhà hàng" active />
                      <POIPinMarker score={5.0} category="cà phê" />
                      <POIPinMarker score={1.5} category="" />
                      <POIPinMarker score={0} category="khách sạn" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-h2 mb-4">Đánh giá Trợ Năng M3 Cốt Lõi</h2>
              <div className="p-4 bg-surface-container-lowest border border-outline rounded-xl shadow-m3-md space-y-4">
                <POIPerformanceBreakdown features={dummyFeatures} />
              </div>
            </section>

            <section>
              <h2 className="text-h2 mb-4">Hệ thống Bình Luận</h2>
              <ReviewCard review={dummyReview} poiId="123" />
            </section>
          </div>
        </div>
      </div>
    </MapProvider>
  );
}
