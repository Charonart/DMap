'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';

// Store & Context
import { useMapStore } from '@/hooks/useMapStore';
import { useMapContext } from '@/components/map/MapContext';

// Clean UI Primitives
import { Sheet, SheetContent } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input, NativeSelect } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { NativeSlider } from '@/components/ui/NativeSlider';
import { FormSection, FormHeader, FormGroup } from '@/components/ui/FormLayout';
import styles from './CreatePOISheet.module.scss';

import { getCategoryIcon, getCategoryColor } from '@/lib/categoryMeta';

// Icons
import { MapPin, Loader2, Phone, Globe, Clock, Info, ShieldAlert, ListTree } from 'lucide-react';

export function CreatePOISheet() {
  const { isCreatingPOI, setIsCreatingPOI, newPoiCoords, setSelectedPoiId } = useMapStore();
  const { map } = useMapContext();
  const queryClient = useQueryClient();

  // --- Form State ---
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [a11yFeatures, setA11yFeatures] = useState<Record<string, { is_available: boolean, quality_rating: number, note: string }>>({});
  const [errorMsg, setErrorMsg] = useState('');

  // --- Fetch Data ---
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/categories');
      return res.data.data;
    },
    staleTime: 60 * 60 * 1000
  });

  const { data: featureMetaList } = useQuery({
    queryKey: ['accessibility-features'],
    queryFn: async () => {
      const res = await axiosInstance.get('/accessibility-features');
      return res.data.data;
    },
    staleTime: 60 * 60 * 1000
  });

  const groupedFeatures = featureMetaList?.reduce((acc: any, feature: any) => {
    const group = feature.feature_group || 'Khác';
    if (!acc[group]) acc[group] = [];
    acc[group].push(feature);
    return acc;
  }, {});

  // --- Handlers ---
  const toggleFeature = (featId: string) => {
    setA11yFeatures(prev => {
      const exists = !!prev[featId]?.is_available;
      if (exists) {
        const next = { ...prev };
        delete next[featId];
        return next;
      } else {
        return { ...prev, [featId]: { is_available: true, quality_rating: 5, note: '' } };
      }
    });
  };

  const updateFeatureObj = (featId: string, param: 'quality_rating'|'note', val: any) => {
    setA11yFeatures(prev => ({
      ...prev,
      [featId]: { ...prev[featId], [param]: val }
    }));
  };

  const handleClose = () => {
    setIsCreatingPOI(false);
    setName(''); setCategoryId(''); setAddress(''); setDescription('');
    setPhone(''); setWebsite(''); setOpeningHours('');
    setA11yFeatures({}); setErrorMsg('');
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/pois', data);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pois.geojson'] });
      if (res.data && res.data.id) {
        setSelectedPoiId(res.data.id);
        if (map && newPoiCoords) {
          map.flyTo({ center: newPoiCoords, zoom: 16 });
        }
      }
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo địa điểm');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !newPoiCoords || !categoryId) {
      setErrorMsg('Vui lòng điền tên và chọn danh mục.');
      return;
    }

    const featuresPayload = Object.keys(a11yFeatures).map(featId => ({
      feature_id: parseInt(featId),
      is_available: a11yFeatures[featId].is_available,
      quality_rating: a11yFeatures[featId].quality_rating,
      note: a11yFeatures[featId].note
    }));

    createMutation.mutate({
      name,
      address: address || undefined,
      description: description || null,
      category_id: parseInt(categoryId),
      lng: newPoiCoords[0],
      lat: newPoiCoords[1],
      phone: phone || undefined,
      website: website || undefined,
      opening_hours: openingHours || undefined,
      accessibility_features: featuresPayload
    });
  };

  return (
    <Sheet open={isCreatingPOI} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="floatingBottom" padding="none">
        
        <div className={styles.headerSticky}>
          <div className={styles.customHeader}>
            <div className={styles.titleWrapper}>
              <MapPin className="w-5 h-5 text-primary" />
              Tạo Địa Điểm Trợ Năng Mới
            </div>
            {newPoiCoords && (
              <p className={styles.coords}>
                Tọa độ: {newPoiCoords[1].toFixed(5)}, {newPoiCoords[0].toFixed(5)}
              </p>
            )}
          </div>
        </div>

        <div className={cn(styles.contentBody, "no-scrollbar")}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {errorMsg && (
              <div className={styles.errorBox}>
                <ShieldAlert className="w-5 h-5 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* 1. Basic Info */}
            <section>
              <FormHeader icon={<Info className="w-4 h-4" />}>
                1. Thông Tin Cơ Bản
              </FormHeader>
              
              <FormSection>
                <FormGroup label="Tên địa điểm" htmlFor="name" required>
                  <Input id="name" placeholder="Ví dụ: Cơm tấm Ba Ghi" value={name} onChange={e => setName(e.target.value)} />
                </FormGroup>

                <FormGroup label="Danh mục" htmlFor="category" required>
                  <NativeSelect 
                    id="category" 
                    value={categoryId} 
                    onChange={e => setCategoryId(e.target.value)} 
                    leftIcon={
                      categoryId 
                        ? getCategoryIcon(categories?.find((c: any) => c.id.toString() === categoryId)?.icon, 16)
                        : <ListTree className="w-4 h-4" />
                    }
                  >
                    <option value="" disabled>-- Chọn một danh mục --</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name_vi || cat.name}</option>
                    ))}
                  </NativeSelect>
                </FormGroup>

                <FormGroup label="Địa chỉ (Tùy chọn)" htmlFor="address">
                  <Input id="address" placeholder="123 Đường XYZ..." value={address} onChange={e => setAddress(e.target.value)} />
                </FormGroup>

                <FormGroup label="Mô tả thêm (Tùy chọn)" htmlFor="description">
                  <Input id="description" placeholder="Mô tả tổng quản..." value={description} onChange={e => setDescription(e.target.value)} />
                </FormGroup>
              </FormSection>
            </section>

            {/* 2. Contact & Time */}
            <section className={styles.sectionGroup}>
              <FormHeader icon={<Phone className="w-4 h-4" />}>
                2. Liên Hệ & Thời Gian (Tùy chọn)
              </FormHeader>
              <FormSection className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormGroup label="Số Điện Thoại">
                  <Input placeholder="090..." value={phone} onChange={e => setPhone(e.target.value)} leftIcon={<Phone className="w-4 h-4" />} />
                </FormGroup>
                <FormGroup label="Giờ mở cửa">
                  <Input placeholder="08:00 - 22:00" value={openingHours} onChange={e => setOpeningHours(e.target.value)} leftIcon={<Clock className="w-4 h-4" />} />
                </FormGroup>
                <FormGroup label="Trang Web" className="sm:col-span-2">
                  <Input placeholder="https://..." value={website} onChange={e => setWebsite(e.target.value)} leftIcon={<Globe className="w-4 h-4" />} />
                </FormGroup>
              </FormSection>
            </section>

            {/* 3. Accessibility Ratings */}
            <section className={styles.sectionGroup}>
              <FormHeader icon={<ShieldAlert className="w-4 h-4" />}>
                3. Hiện Trạng Trợ Năng (Tùy chọn)
              </FormHeader>

              <div className={styles.featureList}>
                {groupedFeatures && Object.entries(groupedFeatures).map(([group, feats]: [string, any]) => (
                  <FormSection key={group}>
                    <h4 className={styles.featureGroupTitle}>{group}</h4>
                    <div className={styles.featureList}>
                      {feats.map((feat: any) => {
                        const isActive = !!a11yFeatures[feat.id]?.is_available;
                        
                        return (
                          <div key={feat.id} className={styles.featureCard}>
                            <div className={styles.featureHeader}>
                              <Checkbox id={`add-feat-${feat.id}`} checked={isActive} onCheckedChange={() => toggleFeature(feat.id)} />
                              <Label htmlFor={`add-feat-${feat.id}`} className={styles.featureLabel}>
                                {feat.name_vi || feat.name}
                              </Label>
                            </div>

                            {isActive && (
                              <div className={styles.featureDetails}>
                                <FormGroup label="Chấm điểm (1-10)">
                                  <NativeSlider 
                                    min="1" max="10" step="1"
                                    value={a11yFeatures[feat.id].quality_rating}
                                    onChange={(e) => updateFeatureObj(feat.id, 'quality_rating', parseInt(e.target.value))}
                                    valueLabel={a11yFeatures[feat.id].quality_rating}
                                  />
                                </FormGroup>
                                <div className="mt-3">
                                  <Input 
                                    placeholder="Ghi chú thiết kế này..."
                                    value={a11yFeatures[feat.id].note}
                                    onChange={(e) => updateFeatureObj(feat.id, 'note', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </FormSection>
                ))}
              </div>
            </section>

            <div className={styles.footerSticky}>
              <Button type="submit" variant="primary" className="w-full font-bold shadow-m3-md h-12 text-base" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang ghi dữ liệu...</>
                ) : 'Đăng Tải Lên DMap'}
              </Button>
            </div>
          </form>
        </div>

      </SheetContent>
    </Sheet>
  );
}
