/**
 * 여행 코스 편집기 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';
import { createTourCourseSchema, type CreateTourCourseInput } from '@/lib/schemas/tour-course';
import { PlaceSearch, type PlaceSearchResult } from '@/components/map/PlaceSearch';
import { KakaoMap } from '@/components/map/KakaoMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  GripVertical,
  MapPin,
  Save,
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUploadThing } from '@/lib/uploadthing';

type TourCourseEditorProps = {
  courseId?: string;
  initialData?: CreateTourCourseInput;
  locale: string;
};

type SpotFormData = {
  id?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  placeId?: string | null;
  imageUrl?: string | null;
};

export function TourCourseEditor({ courseId, initialData, locale }: TourCourseEditorProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const t = useTranslations('courseEditor');
  const tCategory = useTranslations('category');
  const tDifficulty = useTranslations('difficulty');
  const [spots, setSpots] = useState<SpotFormData[]>(initialData?.spots || []);
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [editingSpotIndex, setEditingSpotIndex] = useState<number | null>(null);

  const form = useForm<CreateTourCourseInput>({
    resolver: zodResolver(createTourCourseSchema),
    defaultValues: initialData ? {
      ...initialData,
      difficulty: initialData.difficulty || 'MODERATE',
      spots: initialData.spots || [],
    } : {
      title: '',
      description: '',
      category: 'FOOD',
      difficulty: 'MODERATE',
      estimatedDuration: 60,
      spots: [],
    },
    mode: 'onChange', // 실시간 validation
  });

  // spots 상태와 폼 동기화
  useEffect(() => {
    form.setValue('spots', spots.map((spot, index) => ({
      ...spot,
      order: index,
    })), {
      shouldValidate: true, // validation 트리거
    });
  }, [spots, form]);

  const createMutation = useMutation({
    ...trpc.tourCourse.create.mutationOptions(),
    onSuccess: (data) => {
      toast.success(t('createSuccess'));
      router.push(`/${locale}/courses/${data.id}`);
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || t('createError'));
    },
  });

  const updateMutation = useMutation({
    ...trpc.tourCourse.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success(t('updateSuccess'));
      router.push(`/${locale}/courses/${data.id}`);
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || t('updateError'));
    },
  });

  const onSubmit = (data: CreateTourCourseInput) => {
    console.log('📝 Form submit triggered', { data, spots: data.spots });

    // spots는 이미 useEffect로 form에 동기화되어 있음
    console.log('✅ Submitting form data:', data);

    if (courseId) {
      updateMutation.mutate({ id: courseId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onError = (errors: any) => {
    console.error('❌ Form validation errors:', errors);
    toast.error('폼 입력을 확인해주세요');
  };

  const handleAddSpot = (place: PlaceSearchResult, description: string, imageUrl?: string) => {
    const newSpot: SpotFormData = {
      name: place.place_name,
      description,
      latitude: Number(place.y),
      longitude: Number(place.x),
      address: place.address_name || place.road_address_name || '',
      placeId: place.id,
      imageUrl: imageUrl || null,
    };

    setSpots([...spots, newSpot]);
    setIsAddingSpot(false);
    toast.success(t('add'));
  };

  const handleRemoveSpot = (index: number) => {
    setSpots(spots.filter((_, i) => i !== index));
    toast.success(t('remove'));
  };

  const handleMoveSpot = (index: number, direction: 'up' | 'down') => {
    const newSpots = [...spots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= spots.length) return;

    [newSpots[index], newSpots[targetIndex]] = [newSpots[targetIndex], newSpots[index]];
    setSpots(newSpots);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('titlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('descriptionPlaceholder')}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('categoryPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FOOD">{tCategory('food')}</SelectItem>
                        <SelectItem value="CAFE">{tCategory('cafe')}</SelectItem>
                        <SelectItem value="HISTORY">{tCategory('history')}</SelectItem>
                        <SelectItem value="NATURE">{tCategory('nature')}</SelectItem>
                        <SelectItem value="SHOPPING">{tCategory('shopping')}</SelectItem>
                        <SelectItem value="NIGHTLIFE">{tCategory('nightlife')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('difficulty')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('difficultyPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EASY">{tDifficulty('easy')}</SelectItem>
                        <SelectItem value="MODERATE">{tDifficulty('moderate')}</SelectItem>
                        <SelectItem value="HARD">{tDifficulty('hard')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('duration')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('durationPlaceholder')}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 장소 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('spotsTitle')} {t('spotsCount', { count: spots.length })}</CardTitle>
              <Button
                type="button"
                onClick={() => setIsAddingSpot(true)}
                disabled={isAddingSpot}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addSpot')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 장소 추가 폼 */}
            {isAddingSpot && (
              <SpotAddForm
                onAdd={handleAddSpot}
                onCancel={() => setIsAddingSpot(false)}
              />
            )}

            {/* 장소 목록 */}
            {spots.map((spot, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveSpot(index, 'up')}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                      <Badge className="w-8 justify-center">{index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveSpot(index, 'down')}
                        disabled={index === spots.length - 1}
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{spot.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {spot.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{spot.address}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSpot(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {spots.length === 0 && !isAddingSpot && (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{t('noSpots')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {courseId ? t('update') : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// 장소 추가 폼 컴포넌트
function SpotAddForm({
  onAdd,
  onCancel,
}: {
  onAdd: (place: PlaceSearchResult, description: string, imageUrl?: string) => void;
  onCancel: () => void;
}) {
  const t = useTranslations('courseEditor');
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing('imageUploader');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const res = await startUpload(Array.from(files));

      if (res && res.length > 0) {
        setImageUrl(res[0].url);
        toast.success(t('imageUploadSuccess') || '이미지 업로드 완료');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('imageUploadError') || '이미지 업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = () => {
    if (!selectedPlace) {
      toast.error(t('searchPlace'));
      return;
    }
    if (!description.trim()) {
      toast.error(t('spotDescription'));
      return;
    }

    onAdd(selectedPlace, description, imageUrl || undefined);
    setSelectedPlace(null);
    setDescription('');
    setImageUrl('');
  };

  return (
    <Card className="border-2 border-primary">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{t('newSpot')}</h4>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Label>{t('searchPlace')}</Label>
          <PlaceSearch
            onSelect={(place) => {
              setSelectedPlace(place);
              toast.success(t('placeSelected', { name: place.place_name }));
            }}
            placeholder={t('searchPlaceholder')}
          />
          {selectedPlace && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t('placeSelected', { name: selectedPlace.place_name })}
              </p>
              <KakaoMap
                center={{
                  latitude: Number(selectedPlace.y),
                  longitude: Number(selectedPlace.x),
                }}
                markers={[
                  {
                    latitude: Number(selectedPlace.y),
                    longitude: Number(selectedPlace.x),
                    title: selectedPlace.place_name,
                    content: selectedPlace.address_name || selectedPlace.road_address_name,
                  },
                ]}
                height="300px"
                level={3}
                className="rounded-lg border"
              />
            </div>
          )}
        </div>

        <div>
          <Label>{t('spotDescription')}</Label>
          <Textarea
            placeholder={t('spotDescriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label>{t('image') || '이미지'}</Label>
          <div className="space-y-2">
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl('')}
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('remove') || '제거'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('uploading') || '업로드 중...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {t('uploadImage') || '이미지 업로드'}
                    </>
                  )}
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {t('imageLimit') || 'JPG, PNG, WEBP (최대 5MB)'}
            </p>
          </div>
        </div>

        <Button type="button" onClick={handleAdd} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t('add')}
        </Button>
      </CardContent>
    </Card>
  );
}

