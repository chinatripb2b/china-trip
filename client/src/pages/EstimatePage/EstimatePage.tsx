import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type IEstimateResult } from '@/api/travel-app';
import { useEstimatePersistence } from '@/hooks/useEstimatePersistence';

import { EstimateControls } from './EstimateControls';
import { EstimateSummary } from './EstimateSummary';
import {
  cityOptions,
  defaultEstimateResult,
  hotelOptions,
  mealOptions,
  scenicSpots,
  transportOptions,
  type IEstimateForm,
} from './estimate.types';

const estimateSchema = z.object({
  travelers: z.coerce.number().min(1, '请输入正确人数').max(500, '人数不超过 500'),
  days: z.coerce.number().min(1, '请输入正确天数').max(60, '天数不超过 60'),
  destination: z.string().min(1, '请选择目的地城市'),
  hotelLevel: z.enum(['经济型', '舒适型', '高端型', '豪华型']),
  transportNeeds: z.string().optional(),
  guideService: z.boolean().default(true),
  ticketBudget: z.coerce.number().min(0, '门票预算不能为负数').optional(),
  extraNotes: z.string().optional(),
  mealStandard: z.string().optional(),
  selectedSpots: z.array(z.string()).default([]),
  profitMargin: z.coerce.number().min(0).max(50).default(0),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

const defaultValues: EstimateFormData = {
  travelers: 12,
  days: 5,
  destination: '北京',
  hotelLevel: '舒适型',
  transportNeeds: '商务专车',
  guideService: true,
  ticketBudget: 500,
  extraNotes: '含接送机与欢迎晚宴需求',
  mealStandard: '标准餐标',
  selectedSpots: ['temple-of-heaven', 'forbidden-city'],
  profitMargin: 12,
};

const EstimatePage: React.FC = () => {
  const { initialForm, latestResult, updatedAt, save } =
    useEstimatePersistence<EstimateFormData>(defaultValues);
  const [selectedCategory, setSelectedCategory] = React.useState('全部');
  const [spotKeyword, setSpotKeyword] = React.useState('');
  const [quotedTotalInput, setQuotedTotalInput] = React.useState('');

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues,
    mode: 'onChange',
  });

  const values = form.watch();

  React.useEffect(() => {
    const currentDestination = values.destination ?? '';
    const nextCategory =
      currentDestination && currentDestination !== '全部'
        ? currentDestination
        : '全部';

    setSelectedCategory(nextCategory);
  }, [values.destination]);

  const filteredSpots = React.useMemo(() => {
    return scenicSpots.filter((spot) => {
      const matchCategory =
        selectedCategory === '全部' || spot.category === selectedCategory;
      const matchKeyword =
        spotKeyword.trim() === '' ||
        spot.name.includes(spotKeyword.trim()) ||
        spot.category.includes(spotKeyword.trim());

      return matchCategory && matchKeyword;
    });
  }, [selectedCategory, spotKeyword]);

  const estimateResult = React.useMemo<IEstimateResult>(() => {
    const destinationFactor =
      cityOptions.find((item) => item.value === values.destination)?.factor ?? 1;
    const hotelFactor =
      hotelOptions.find((item) => item.label === values.hotelLevel)?.multiplier ?? 1;
    const transportFactor =
      transportOptions.find((item) => item.value === values.transportNeeds)?.factor ?? 1;
    const mealFactor =
      mealOptions.find((item) => item.value === values.mealStandard)?.factor ?? 1;
    const selectedSpotList = scenicSpots.filter((spot) =>
      (values.selectedSpots ?? []).includes(spot.id),
    );

    const travelers = values.travelers || 0;
    const days = values.days || 0;
    const manualTicketBudget = values.ticketBudget || 0;
    const scenicTicketBudget = selectedSpotList.reduce(
      (sum, spot) => sum + spot.ticketPrice,
      0,
    );
    const ticketBudget = Math.max(manualTicketBudget, scenicTicketBudget);

    const hotelCost = travelers * days * 280 * hotelFactor;
    const transportCost = travelers * days * 65 * transportFactor;
    const guideCost = values.guideService ? days * 900 : 0;
    const ticketCost = travelers * ticketBudget;
    const mealCost = travelers * days * 80 * mealFactor;
    const otherCost = Math.round(
      (travelers * 120 + days * 260 + mealCost) * destinationFactor,
    );
    const totalCost = Math.round(
      (hotelCost + transportCost + guideCost + ticketCost + otherCost) *
        destinationFactor,
    );
    const perPersonCost = travelers > 0 ? Math.round(totalCost / travelers) : 0;

    return {
      totalCost,
      perPersonCost,
      hotelCost: Math.round(hotelCost),
      transportCost: Math.round(transportCost),
      guideCost: Math.round(guideCost),
      ticketCost: Math.round(ticketCost),
      otherCost: Math.round(otherCost),
    };
  }, [values]);

  React.useEffect(() => {
    form.reset(initialForm);
    setQuotedTotalInput('');
  }, [form, initialForm]);

  const displayValues: IEstimateForm = {
    travelers: values.travelers ?? defaultValues.travelers,
    days: values.days ?? defaultValues.days,
    destination: values.destination ?? defaultValues.destination,
    hotelLevel: values.hotelLevel ?? defaultValues.hotelLevel,
    transportNeeds: values.transportNeeds,
    guideService: values.guideService,
    ticketBudget: values.ticketBudget,
    extraNotes: values.extraNotes,
    mealStandard: values.mealStandard,
    selectedSpots: values.selectedSpots,
    profitMargin: values.profitMargin,
  };

  const handleSubmit = async (data: EstimateFormData) => {
    await save(
      {
        travelers: data.travelers,
        days: data.days,
        destination: data.destination,
        hotelLevel: data.hotelLevel,
        transportNeeds: data.transportNeeds,
        guideService: data.guideService,
        ticketBudget: data.ticketBudget,
        extraNotes: data.extraNotes,
      },
      estimateResult,
    );
  };

  return (
    <>
      <style jsx>{`
        .estimate-page {
          animation: fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="estimate-page w-full space-y-5 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <EstimateControls
              form={form}
              filteredSpots={filteredSpots}
              selectedCategory={selectedCategory}
              spotKeyword={spotKeyword}
              onCategoryChange={setSelectedCategory}
              onSpotKeywordChange={setSpotKeyword}
            />
            <EstimateSummary
              result={latestResult ?? estimateResult ?? defaultEstimateResult}
              formValues={displayValues}
              updatedAt={updatedAt}
              profitMargin={displayValues.profitMargin ?? 0}
              quotedTotalInput={quotedTotalInput}
              onProfitMarginChange={(value) => form.setValue('profitMargin', value)}
              onQuotedTotalInputChange={setQuotedTotalInput}
            />
          </form>
        </Form>
      </div>
    </>
  );
};

export default EstimatePage;
