import React from 'react';
import {
  BedDoubleIcon,
  BusFrontIcon,
  CheckIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  SoupIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import {
  cityOptions,
  hotelOptions,
  mealOptions,
  scenicSpots,
  spotCategories,
  transportOptions,
} from './estimate.types';

interface EstimateControlsProps {
  form: UseFormReturn<Record<string, unknown>>;
  filteredSpots: typeof scenicSpots;
  selectedCategory: string;
  spotKeyword: string;
  onCategoryChange: (value: string) => void;
  onSpotKeywordChange: (value: string) => void;
}

const sectionCardClassName =
  'rounded-[24px] border border-border bg-white p-5 shadow-[0_10px_30px_rgba(120,32,24,0.08)]';
const optionCardClassName =
  'rounded-[18px] px-4 py-4 text-left transition-all duration-150 active:scale-[0.98]';
const optionCardActiveClassName =
  'border border-primary bg-[hsl(350_60%_92%)]';
const optionCardIdleClassName = 'bg-[hsl(350_35%_95%)]';

interface StepperFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  suffix: string;
  icon: React.ReactNode;
}

const StepperField: React.FC<StepperFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
  icon,
}) => {
  const safeValue = Number.isFinite(value) ? value : min;

  return (
    <div className="rounded-[20px] bg-[hsl(350_55%_96%)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">点击调整 {suffix}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, safeValue - 1))}
            className="flex size-9 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-all duration-150 active:scale-[0.98]"
          >
            <MinusIcon className="size-4" />
          </button>
          <div className="min-w-14 text-center">
            <p className="text-xl font-black tabular-nums text-foreground">{safeValue}</p>
            <p className="text-[11px] text-muted-foreground">{suffix}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, safeValue + 1))}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(160,30,30,0.18)] transition-all duration-150 active:scale-[0.98]"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const EstimateControls: React.FC<EstimateControlsProps> = ({
  form,
  filteredSpots,
  selectedCategory,
  spotKeyword,
  onCategoryChange,
  onSpotKeywordChange,
}) => {
  const selectedSpots = (form.watch('selectedSpots') as string[] | undefined) ?? [];

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-[linear-gradient(180deg,#f7eaea_0%,#f9f2f2_100%)] px-5 py-5 shadow-[0_12px_30px_rgba(120,32,24,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">费用测算</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              定制行程报价
            </h1>
          </div>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-white text-foreground shadow-sm"
          >
            <ChevronDownIcon className="size-5" />
          </button>
        </div>
      </section>

      <section className={sectionCardClassName}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">基础信息</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            确认出行天数、人数与目的城市，快速建立测算基础。
          </p>
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <StepperField
                    label="出行天数"
                     value={Number(field.value ?? 0)}

                    onChange={field.onChange}
                    min={1}
                    max={60}
                    suffix="天"
                    icon={<SparklesIcon className="size-5" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="travelers"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <StepperField
                    label="出行人数"
                     value={Number(field.value ?? 0)}

                    onChange={field.onChange}
                    min={1}
                    max={500}
                    suffix="人"
                    icon={<UsersIcon className="size-5" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目的地城市</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-3" data-ai-section-type="card-list">
                    {cityOptions.map((option) => {
                      const isActive = field.value === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={[
                            optionCardClassName,
                            isActive ? optionCardActiveClassName : optionCardIdleClassName,
                            'text-foreground',
                          ].join(' ')}
                        >
                          <p className="text-sm font-semibold">{option.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormDescription>按目的地城市选择，景点列表会同步切换。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section className={sectionCardClassName}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(350_50%_95%)] text-primary">
            <BedDoubleIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">住宿标准</h2>
            <p className="text-xs text-muted-foreground">选择适配客户定位的酒店档次。</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="hotelLevel"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-2 gap-3" data-ai-section-type="card-list">
                  {hotelOptions.map((option) => {
                    const isActive = field.value === option.label;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => field.onChange(option.label)}
                        className={[
                          optionCardClassName,
                          isActive
                            ? `${optionCardActiveClassName} shadow-[0_10px_20px_rgba(184,46,56,0.12)]`
                            : optionCardIdleClassName,
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{option.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{option.note}</p>
                            <p className="mt-2 text-xs font-medium text-primary">{option.price}</p>
                          </div>
                          {isActive ? (
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckIcon className="size-3.5" />
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className={sectionCardClassName}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(350_50%_95%)] text-primary">
            <SoupIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">用餐标准</h2>
            <p className="text-xs text-muted-foreground">根据接待规格配置日常餐标。</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="mealStandard"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-2 gap-3" data-ai-section-type="card-list">
                  {mealOptions.map((option) => {
                    const isActive = field.value === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={[
                          optionCardClassName,
                          isActive ? optionCardActiveClassName : optionCardIdleClassName,
                        ].join(' ')}
                      >
                        <p className="text-sm font-semibold text-foreground">{option.label}</p>
                        <p className="mt-2 text-xs font-medium text-primary">{option.price}</p>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className={sectionCardClassName}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">景点选择</h2>
          <p className="mt-1 text-xs text-muted-foreground">按目的地城市筛选景点，系统会自动估算票务成本。</p>
        </div>

        <div className="flex flex-wrap gap-2" data-ai-section-type="button">
          {spotCategories.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={[
                  'rounded-full px-4 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.98]',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-[hsl(350_35%_95%)] text-muted-foreground',
                ].join(' ')}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="relative mt-4">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={spotKeyword}
            onChange={(event) => onSpotKeywordChange(event.target.value)}
            className="h-11 rounded-2xl border-0 bg-[hsl(350_35%_95%)] pl-11"
            placeholder="搜索景点"
          />
        </div>

        <FormField
          control={form.control}
          name="selectedSpots"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormControl>
                <div className="space-y-3" data-ai-section-type="card-list">
                  {filteredSpots.map((spot) => {
                     const currentValues = Array.isArray(field.value)
                       ? (field.value as string[])
                       : [];
                     const isActive = currentValues.includes(spot.id);


                    return (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => {
                           const current = Array.isArray(field.value)
                             ? (field.value as string[])
                             : [];
                           const next = current.includes(spot.id)
                             ? current.filter((item) => item !== spot.id)
                             : [...current, spot.id];

                          field.onChange(next);
                        }}
                        className={[
                          'flex w-full items-center gap-3 rounded-[20px] p-3 text-left transition-all duration-150 active:scale-[0.99]',
                          isActive
                            ? 'bg-[hsl(350_60%_92%)]'
                            : 'bg-[hsl(350_35%_95%)]',
                        ].join(' ')}
                      >
                        <Image
                          src={spot.image}
                          alt={spot.name}
                          width={84}
                          height={84}
                          className="size-[84px] rounded-2xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{spot.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{spot.category}</p>
                            </div>
                            <span
                              className={[
                                'mt-1 flex size-5 shrink-0 items-center justify-center rounded-md border',
                                isActive
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-white text-transparent',
                              ].join(' ')}
                            >
                              <CheckIcon className="size-3.5" />
                            </span>
                          </div>
                          <p className="mt-3 text-xs font-medium text-primary">
                            门票 {spot.ticketPrice === 0 ? '免费' : `¥${spot.ticketPrice}/人`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormDescription>已选 {selectedSpots.length} 个景点，支持多选。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className={sectionCardClassName}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(350_50%_95%)] text-primary">
            <BusFrontIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">用车情况</h2>
            <p className="text-xs text-muted-foreground">根据接待标准选择车型，并配置导游与补充说明。</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="transportNeeds"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-2 gap-3" data-ai-section-type="card-list">
                  {transportOptions.map((option) => {
                    const isActive = field.value === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={[
                          optionCardClassName,
                          isActive ? optionCardActiveClassName : optionCardIdleClassName,
                        ].join(' ')}
                      >
                        <p className="text-sm font-semibold text-foreground">{option.label}</p>
                        <p className="mt-2 text-xs font-medium text-primary">{option.price}</p>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="guideService"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-[20px] bg-[hsl(350_35%_95%)] px-4 py-4">
                <div>
                  <FormLabel className="text-sm font-semibold text-foreground">导游服务</FormLabel>
                  <FormDescription>开启后计入双语导游与现场执行费用。</FormDescription>
                </div>
                <FormControl>
                   <Switch
                     checked={Boolean(field.value)}
                     onCheckedChange={field.onChange}
                   />

                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extraNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>补充说明</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                     value={String(field.value ?? '')}

                    onChange={field.onChange}
                    className="resize-none rounded-[20px] border-0 bg-[hsl(350_35%_95%)]"
                    placeholder="如需欢迎晚宴、翻译陪同、商务拜访等，请在此补充"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-white p-5 shadow-[0_10px_30px_rgba(120,32,24,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(350_50%_95%)] text-primary">
            <SparklesIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">快速校准</h2>
            <p className="text-xs text-muted-foreground">可手动调整预估门票预算。</p>
          </div>
        </div>

        <div className="mt-4">
          <FormField
            control={form.control}
            name="ticketBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>人均门票预算</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                     value={Number(field.value ?? 0)}

                    onChange={(event) => field.onChange(Number(event.target.value))}
                    className="h-11 rounded-2xl border-0 bg-[hsl(350_35%_95%)]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded-xl border-0 bg-[hsl(350_35%_95%)]"
            onClick={() => form.reset()}
          >
            重置
          </Button>
          <Button
            type="submit"
            className="flex-1 rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(160,30,30,0.18)]"
            data-ai-section-type="button"
          >
            计算价格
          </Button>
        </div>
      </section>
    </div>
  );
};
