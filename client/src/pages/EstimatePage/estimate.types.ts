import type { IEstimateResult } from '@/api/travel-app';

export interface IEstimateForm {
  travelers: number;
  days: number;
  destination: string;
  hotelLevel: '经济型' | '舒适型' | '高端型' | '豪华型';
  transportNeeds?: string;
  guideService?: boolean;
  ticketBudget?: number;
  extraNotes?: string;
  mealStandard?: string;
  selectedSpots?: string[];
  profitMargin?: number;
}

export const defaultEstimateResult: IEstimateResult = {
  totalCost: 0,
  perPersonCost: 0,
  hotelCost: 0,
  transportCost: 0,
  guideCost: 0,
  ticketCost: 0,
  otherCost: 0,
};

export const cityOptions = [
  {
    label: '北京',
    value: '北京',
    factor: 1,
    description: '适合经典文化入境行程与政商务接待',
  },
  {
    label: '西安',
    value: '西安',
    factor: 1.16,
    description: '聚焦历史遗产与丝路文化体验',
  },
  {
    label: '上海',
    value: '上海',
    factor: 1.22,
    description: '兼顾都市商务拜访与高端体验',
  },
  {
    label: '江南',
    value: '江南',
    factor: 1.26,
    description: '适合水乡文化与多城联游行程',
  },
];

export const hotelOptions: Array<{
  label: IEstimateForm['hotelLevel'];
  multiplier: number;
  note: string;
  price: string;
}> = [
  { label: '经济型', multiplier: 1, note: '适合预算优先', price: '¥280/晚' },
  { label: '舒适型', multiplier: 1.18, note: '平衡体验与成本', price: '¥380/晚' },
  { label: '高端型', multiplier: 1.46, note: '高品质商务团', price: '¥520/晚' },
  { label: '豪华型', multiplier: 1.88, note: '高净值客户接待', price: '¥680/晚' },
];

export const mealOptions = [
  { label: '经济餐标', value: '经济餐标', factor: 1, price: '¥80/人/天' },
  { label: '标准餐标', value: '标准餐标', factor: 1.35, price: '¥120/人/天' },
  { label: '高端餐标', value: '高端餐标', factor: 1.8, price: '¥180/人/天' },
  { label: '定制宴席', value: '定制宴席', factor: 2.4, price: '¥280/人/天' },
];

export const transportOptions = [
  { label: '基础用车', value: '基础用车', factor: 1, price: '¥65/人/天' },
  { label: '商务专车', value: '商务专车', factor: 1.35, price: '¥90/人/天' },
  { label: '中巴接待', value: '中巴接待', factor: 1.55, price: '¥100/人/天' },
  { label: '高端车队', value: '高端车队', factor: 1.9, price: '¥125/人/天' },
];

export const spotCategories = ['全部', '北京', '西安', '上海', '江南', '长城'];

export interface IScenicSpot {
  id: string;
  name: string;
  category: string;
  image: string;
  ticketPrice: number;
}

export const scenicSpots: IScenicSpot[] = [
  { id: 'temple-of-heaven', name: '天坛公园', category: '北京', image: 'https://miaoda.feishu.cn/aily/api/v1/files/static/3fefeffb10144013bb30e099c2ed093e_ve_miaoda', ticketPrice: 34 },
  { id: 'forbidden-city', name: '故宫博物院', category: '北京', image: 'https://miaoda.feishu.cn/aily/api/v1/files/static/6a4bd7b45be74000b8954a15fbc47cb8_ve_miaoda', ticketPrice: 60 },
  { id: 'great-wall', name: '八达岭长城', category: '长城', image: 'https://miaoda.feishu.cn/aily/api/v1/files/static/85a1c1d96da44affb439ef5dab04994c_ve_miaoda', ticketPrice: 40 },
  { id: 'the-bund', name: '上海外滩', category: '上海', image: 'https://miaoda.feishu.cn/aily/api/v1/files/static/c85acfb4dfcf41e4b2373c3162d53ace_ve_miaoda', ticketPrice: 0 },
  { id: 'terracotta', name: '秦始皇兵马俑', category: '西安', image: 'https://miaoda.feishu.cn/aily/api/v1/files/static/e2479ca8ec1b409d8091d87bb370819b_ve_miaoda', ticketPrice: 120 },
  { id: 'suzhou-garden', name: '苏州拙政园', category: '江南', image: 'https://miaoda.feishu.cn/aily/api/v1/files/static/e2eae02296b0404d83acf2ddf82f9a77_ve_miaoda', ticketPrice: 70 },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value);
