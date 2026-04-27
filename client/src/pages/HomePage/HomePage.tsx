import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  Globe2Icon,
  HandshakeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Users2Icon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import templeHeroImage from '@shared/static/temple-hero.jpg';

interface IHomePageProps {}

interface IHighlightItem {
  label: string;
  value: string;
  hint: string;
}

interface ICapabilityItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ICustomerItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const highlightItems: IHighlightItem[] = [
  {
    label: '覆盖目的地',
    value: '20+',
    hint: '核心入境线路与主题城市资源',
  },
  {
    label: '服务响应',
    value: '7×12h',
    hint: '商务对接与方案调整快速协同',
  },
  {
    label: '方案输出',
    value: '1站式',
    hint: '产品、报价、支持信息集中处理',
  },
];

const capabilityItems: ICapabilityItem[] = [
  {
    title: '平台定位',
    description:
      '面向旅行社、渠道合作方与采购团队，提供中国入境游产品介绍、资源整合与商务沟通入口。',
    icon: Globe2Icon,
  },
  {
    title: '定制服务能力',
    description:
      '围绕行程组合、接待标准、预算测算与目的地匹配，帮助团队快速形成可落地方案框架。',
    icon: SparklesIcon,
  },
  {
    title: '交付与协同',
    description:
      '支持商务咨询、需求梳理、基础费用测算与历史信息留存，减少前期沟通成本。',
    icon: ShieldCheckIcon,
  },
];

const customerItems: ICustomerItem[] = [
  {
    title: '旅行社',
    description: '适合做线路包装、产品上新与客户方案预审。',
    icon: BriefcaseBusinessIcon,
  },
  {
    title: '地接社',
    description: '适合快速沟通接待标准、资源匹配与执行节奏。',
    icon: Building2Icon,
  },
  {
    title: '企业客户',
    description: '适合商务考察、团组访问与定制接待项目洽谈。',
    icon: Users2Icon,
  },
  {
    title: '渠道伙伴',
    description: '适合做联合推广、资源采购与合作机会拓展。',
    icon: HandshakeIcon,
  },
];

const HomePage: React.FC<IHomePageProps> = () => {
  const navigate = useNavigate();

  return (
    <>
      <style jsx>{`
        .home-page {
          animation: fadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-copy {
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
        }

        .soft-grain::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.18) 0, transparent 26%),
            radial-gradient(circle at 78% 14%, rgba(255, 255, 255, 0.1) 0, transparent 22%),
            radial-gradient(circle at 50% 82%, rgba(255, 255, 255, 0.08) 0, transparent 28%);
          mix-blend-mode: screen;
          pointer-events: none;
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

      <div className="home-page w-full space-y-5">
        <section className="w-full overflow-hidden rounded-b-[28px] rounded-t-[28px] shadow-[0_18px_40px_rgba(90,20,20,0.18)]">
          <div className="soft-grain relative h-[320px] overflow-hidden rounded-[28px] bg-primary text-primary-foreground">
              <Image
                src={templeHeroImage}
                alt="天坛主视觉"
                sizes="100vw"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

            <div className="absolute inset-0 bg-gradient-to-b from-[hsla(2,72%,42%,0.22)] via-[hsla(4,78%,38%,0.52)] to-[hsla(8,70%,18%,0.78)]" />
            <div className="absolute inset-0 bg-black/10" />

            <div className="relative flex h-full flex-col justify-between px-4 pt-5 pb-6">
              <div className="flex w-full items-start justify-between gap-3">
                <Badge className="border border-white/15 bg-white/15 px-3 py-1 text-white backdrop-blur-sm hover:bg-white/15">
                  中国入境游B端平台
                </Badge>
                <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-medium text-white/88 backdrop-blur-sm">
                  商务合作版
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="hero-copy text-xs font-medium tracking-[0.22em] text-white/80">
                    CHINA TRAVEL B2B PLATFORM
                  </p>
                  <h1 className="hero-copy text-3xl font-black tracking-tight text-white">
                    一站式定制中国入境游方案
                  </h1>
                  <p className="hero-copy max-w-[18rem] text-sm leading-6 text-white/85">
                    面向旅行社、渠道伙伴与采购团队，快速了解平台能力、形成接待框架并完成费用测算。
                  </p>
                </div>

                <div className="flex items-center">
                  <Button
                    type="button"
                    onClick={() => navigate('/estimate')}
                    className="h-11 rounded-xl bg-white px-4 text-sm font-semibold text-primary shadow-[0_10px_24px_rgba(0,0,0,0.16)] hover:bg-white/95 active:scale-[0.98]"
                  >
                    立即测算
                    <ArrowRightIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-[0_10px_30px_rgba(120,32,24,0.08)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(120,32,24,0.1)]">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <BadgeCheckIcon className="size-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">平台介绍</h2>
                  <p className="text-xs text-muted-foreground">建立可信形象，帮助客户快速理解合作价值</p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                {capabilityItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(252,247,245,0.96))] p-4"
                    >
                      <div className="mb-2 flex items-center gap-2 text-foreground">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                          <Icon className="size-4" />
                        </div>
                        <h3 className="text-base font-semibold">{item.title}</h3>
                      </div>
                      <p>{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="w-full">
          <Card className="rounded-2xl border-border bg-card shadow-[0_10px_30px_rgba(120,32,24,0.08)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(120,32,24,0.1)]">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">数据背书</h2>
                  <p className="text-xs text-muted-foreground">以清晰数字传达平台能力与服务效率</p>
                </div>
                <Badge variant="secondary" className="rounded-full border border-border bg-secondary text-secondary-foreground">
                  商务可信
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {highlightItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-[linear-gradient(135deg,rgba(250,244,242,0.9),rgba(255,255,255,0.98))] p-4"
                  >
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-primary tabular-nums">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.hint}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="w-full">
          <Card className="rounded-2xl border-border bg-card shadow-[0_10px_30px_rgba(120,32,24,0.08)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(120,32,24,0.1)]">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Users2Icon className="size-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">客户群体</h2>
                  <p className="text-xs text-muted-foreground">聚焦高频合作对象，匹配更明确的商务场景</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {customerItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-border bg-card p-4 shadow-[0_6px_16px_rgba(120,32,24,0.05)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default HomePage;
