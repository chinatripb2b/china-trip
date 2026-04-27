import React from 'react';
import html2canvas from 'html2canvas';
import {
  CalculatorIcon,
  CircleDollarSignIcon,
  DownloadIcon,
  HandCoinsIcon,
  ReceiptTextIcon,
} from 'lucide-react';

import type { IEstimateResult } from '@/api/travel-app';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

import { formatPrice, scenicSpots, type IEstimateForm } from './estimate.types';

interface EstimateSummaryProps {
  result: IEstimateResult;
  formValues: IEstimateForm;
  updatedAt: string;
  profitMargin: number;
  quotedTotalInput: string;
  onProfitMarginChange: (value: number) => void;
  onQuotedTotalInputChange: (value: string) => void;
}

const summaryItemClassName =
  'rounded-[20px] bg-white/70 px-4 py-4 shadow-[0_8px_20px_rgba(120,32,24,0.06)]';

const parseCurrencyInput = (value: string) => {
  const normalized = value.replace(/[^\d]/gu, '');
  return normalized ? Number(normalized) : 0;
};

export const EstimateSummary: React.FC<EstimateSummaryProps> = ({
  result,
  formValues,
  updatedAt,
  profitMargin,
  quotedTotalInput,
  onProfitMarginChange,
  onQuotedTotalInputChange,
}) => {
  const quoteSheetRef = React.useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const quotedTotal = React.useMemo(() => {
    const manualValue = parseCurrencyInput(quotedTotalInput);
    if (manualValue > 0) {
      return manualValue;
    }

    return Math.round(result.totalCost * (1 + profitMargin / 100));
  }, [profitMargin, quotedTotalInput, result.totalCost]);
  const quotedPerPerson = formValues.travelers
    ? Math.round(quotedTotal / formValues.travelers)
    : 0;
  const selectedSpotNames = scenicSpots
    .filter((spot) => (formValues.selectedSpots ?? []).includes(spot.id))
    .map((spot) => spot.name);

  const items = [
    { key: 'hotel', label: '住宿费用', value: result.hotelCost },
    { key: 'transport', label: '交通用车', value: result.transportCost },
    { key: 'guide', label: '导游服务', value: result.guideCost },
    { key: 'ticket', label: '景点门票', value: result.ticketCost },
    { key: 'other', label: '综合服务', value: result.otherCost },
  ];

  const quoteSummaryText = [
    `目的地：${formValues.destination}`,
    `天数：${formValues.days} 天`,
    `人数：${formValues.travelers} 人`,
    `酒店：${formValues.hotelLevel}`,
    `用餐：${formValues.mealStandard ?? '未设置'}`,
    `用车：${formValues.transportNeeds ?? '未设置'}`,
    `景点：${selectedSpotNames.join('、') || '未选择'}`,
    `补充说明：${formValues.extraNotes || '无'}`,
  ].join('\n');

  const handleGenerateQuoteSheet = async () => {
    if (!quoteSheetRef.current) {
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(quoteSheetRef.current, {
        backgroundColor: '#fffaf8',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `报价单-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsDialogOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <section className="rounded-[28px] bg-[linear-gradient(180deg,#c4454e_0%,#a92f39_100%)] p-5 text-white shadow-[0_18px_40px_rgba(90,20,20,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-white/72">总价格</p>
              <div className="mt-3 space-y-2">
                <Input
                  value={quotedTotalInput}
                  onChange={(event) => onQuotedTotalInputChange(event.target.value)}
                  inputMode="numeric"
                  className="h-14 border-white/16 bg-white/12 text-3xl font-black tracking-tight text-white placeholder:text-white/55"
                  placeholder={formatPrice(quotedTotal)}
                />
                <p className="text-xs text-white/72">支持直接输入对客总价，未输入时按成本与利润率自动计算。</p>
              </div>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
              <CalculatorIcon className="size-6" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3" data-ai-section-type="card-stat">
            <div className={summaryItemClassName}>
              <p className="text-xs text-[hsl(8_28%_16%/0.6)]">基础成本</p>
              <p className="mt-2 text-lg font-bold text-[hsl(8_28%_16%)]">
                {formatPrice(result.totalCost)}
              </p>
            </div>
            <div className={summaryItemClassName}>
              <p className="text-xs text-[hsl(8_28%_16%/0.6)]">人均报价</p>
              <p className="mt-2 text-lg font-bold text-[hsl(8_28%_16%)]">
                {formatPrice(quotedPerPerson)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-white p-5 shadow-[0_10px_30px_rgba(120,32,24,0.08)]">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(217_80%_95%)] text-[hsl(217_72%_54%)]">
              <HandCoinsIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">利润设置</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    通过滑动调整对外报价利润率。
                  </p>
                </div>
                <span className="rounded-full bg-[hsl(217_80%_95%)] px-3 py-1 text-xs font-semibold text-[hsl(217_72%_54%)]">
                  {profitMargin}%
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <Slider
                  value={[profitMargin]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={(value) => onProfitMarginChange(value[0] ?? 0)}
                  className="py-1"
                />
                <div className="flex justify-between gap-3 text-[11px] text-muted-foreground">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-white p-5 shadow-[0_10px_30px_rgba(120,32,24,0.08)]">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(350_50%_95%)] text-primary">
              <ReceiptTextIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">费用构成</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                实时展示当前配置下的主要成本构成。
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3" data-ai-section-type="card-list">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-[18px] bg-[hsl(350_35%_96%)] px-4 py-4"
              >
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{formatPrice(item.value)}</p>
              </div>
            ))}
          </div>

          <Button
            type="button"
            className="mt-4 w-full rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(160,30,30,0.18)]"
            onClick={() => setIsDialogOpen(true)}
            data-ai-section-type="button"
          >
            <DownloadIcon className="size-4" />
            生成对客报价单
          </Button>
        </section>

        <section className="rounded-[24px] border border-border bg-white p-5 shadow-[0_10px_30px_rgba(120,32,24,0.08)]">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(350_50%_95%)] text-primary">
              <CircleDollarSignIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">报价说明</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                当前测算结果适用于初步商务沟通与方案筛选。
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Alert className="rounded-[20px] border-0 bg-[hsl(350_35%_96%)] text-foreground">
              <AlertTitle>已包含内容</AlertTitle>
              <AlertDescription>
                住宿、交通、导游、门票与综合服务成本已纳入测算。
              </AlertDescription>
            </Alert>
            <Alert className="rounded-[20px] border-0 bg-[hsl(350_35%_96%)] text-foreground">
              <AlertTitle>建议补充</AlertTitle>
              <AlertDescription>
                如需欢迎晚宴、商务宴请或特殊翻译，请在补充说明中填写。
              </AlertDescription>
            </Alert>
            <Alert variant="success" className="rounded-[20px] border-0">
              <AlertTitle>{updatedAt ? '最近已保存' : '建议保存结果'}</AlertTitle>
              <AlertDescription>
                {updatedAt
                  ? `最近更新时间：${updatedAt}`
                  : '确认价格后可保存本次测算结果，方便后续跟进。'}
              </AlertDescription>
            </Alert>
          </div>
        </section>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-[28px] border-border bg-[hsl(28_25%_97%)] p-0" showCloseButton={false}>
          <DialogHeader className="px-5 pt-5 text-left">
            <DialogTitle>生成对客报价单</DialogTitle>
            <DialogDescription>
              将当前测算条件、费用构成与对客总价导出为图片。
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 pb-5">
            <div
              ref={quoteSheetRef}
              className="rounded-[24px] border border-border bg-white p-5 shadow-[0_10px_30px_rgba(120,32,24,0.08)]"
            >
              <div className="rounded-[22px] bg-[linear-gradient(180deg,#c4454e_0%,#a92f39_100%)] p-5 text-white">
                <p className="text-xs font-medium text-white/75">中国入境游定制报价单</p>
                <p className="mt-3 text-3xl font-black tracking-tight">
                  {formatPrice(quotedTotal)}
                </p>
                <p className="mt-2 text-xs text-white/80">
                  人均报价 {formatPrice(quotedPerPerson)}
                </p>
              </div>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-[hsl(350_35%_96%)] px-4 py-3">
                    <p className="text-xs text-muted-foreground">目的地</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formValues.destination}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-[hsl(350_35%_96%)] px-4 py-3">
                    <p className="text-xs text-muted-foreground">天数 / 人数</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formValues.days} 天 / {formValues.travelers} 人
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-[hsl(350_35%_96%)] px-4 py-3">
                    <p className="text-xs text-muted-foreground">酒店</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formValues.hotelLevel}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-[hsl(350_35%_96%)] px-4 py-3">
                    <p className="text-xs text-muted-foreground">用餐</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formValues.mealStandard ?? '未设置'}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-[hsl(350_35%_96%)] px-4 py-3">
                    <p className="text-xs text-muted-foreground">用车</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formValues.transportNeeds ?? '未设置'}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-[hsl(350_35%_96%)] px-4 py-3">
                    <p className="text-xs text-muted-foreground">景点</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {selectedSpotNames.join('、') || '未选择'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    补充说明
                  </p>
                  <Textarea
                    value={formValues.extraNotes || '无'}
                    readOnly
                    rows={4}
                    className="mt-2 resize-none rounded-[20px] border-0 bg-[hsl(350_35%_96%)] text-sm text-foreground"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">行程摘要</p>
                  <Textarea
                    value={quoteSummaryText}
                    readOnly
                    rows={8}
                    className="mt-2 resize-none rounded-[20px] border-0 bg-[hsl(350_35%_96%)] text-sm text-foreground"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">费用构成</p>
                  <div className="mt-2 space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-3 rounded-[16px] bg-[hsl(350_35%_96%)] px-4 py-3"
                      >
                        <span className="text-sm text-foreground">{item.label}</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[20px] border border-border bg-[hsl(28_25%_98%)] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">总价格</span>
                    <span className="text-base font-semibold text-foreground">
                      {formatPrice(quotedTotal)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">人均报价</span>
                    <span className="text-base font-semibold text-foreground">
                      {formatPrice(quotedPerPerson)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl border-0 bg-[hsl(350_35%_95%)]"
                onClick={() => setIsDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl bg-primary text-primary-foreground"
                onClick={handleGenerateQuoteSheet}
                disabled={isGenerating}
              >
                {isGenerating ? '生成中...' : '下载截图'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
