import React from 'react';
import {
  Building2Icon,
  ChevronRightIcon,
  Clock3Icon,
  FileSpreadsheetIcon,
  HeadphonesIcon,
  PhoneCallIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircle2Icon,
} from 'lucide-react';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';

import { getLatestTravelAppRecord, type IEstimateResult, type IUserProfile } from '@/api/travel-app';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface IProfileShortcut {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClassName: string;
}

interface IHistoryMetric {
  label: string;
  value: string;
}

const fallbackUserProfile: IUserProfile = {
  id: 'guest-biz-user',
  name: '刘晨',
  company: '华旅国际渠道中心',
  role: '采购经理',
  avatar: '',
  phone: '400-820-1688',
};

const serviceShortcuts: IProfileShortcut[] = [
  {
    title: '历史测算',
    description: '查看最近生成的方案报价',
    icon: FileSpreadsheetIcon,
    accentClassName: 'bg-[hsl(6_65%_95%)] text-primary',
  },
  {
    title: '商务支持',
    description: '获取落地接待与报价协助',
    icon: HeadphonesIcon,
    accentClassName: 'bg-[hsl(145_45%_94%)] text-[var(--success)]',
  },
  {
    title: '联系顾问',
    description: '对接专属入境游顾问',
    icon: PhoneCallIcon,
    accentClassName: 'bg-[hsl(38_100%_94%)] text-[var(--warning)]',
  },
  {
    title: '账户信息',
    description: '维护机构与联系人资料',
    icon: ShieldCheckIcon,
    accentClassName: 'bg-secondary text-foreground',
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value);
};

const getInitials = (name: string) => {
  return name.slice(0, 1) || '游';
};

const ProfilePage: React.FC = () => {
  const currentProfile = useCurrentUserProfile();
  const [storedUserProfile, setStoredUserProfile] = React.useState<IUserProfile | null>(null);
  const [storedEstimateResult, setStoredEstimateResult] = React.useState<IEstimateResult | null>(null);

  React.useEffect(() => {
    let active = true;

    getLatestTravelAppRecord().then((record) => {
      if (!active || !record) {
        return;
      }

      setStoredUserProfile(record.profile);
      setStoredEstimateResult(record.estimateResult);
    });

    return () => {
      active = false;
    };
  }, []);

  const profileData: IUserProfile = {
    ...fallbackUserProfile,
    ...storedUserProfile,
    id: storedUserProfile?.id || currentProfile.user_id || fallbackUserProfile.id,
    name: storedUserProfile?.name || currentProfile.name || fallbackUserProfile.name,
    avatar: storedUserProfile?.avatar || currentProfile.avatar || fallbackUserProfile.avatar,
  };

  const latestEstimate =
    storedEstimateResult ||
    ({
      totalCost: 36800,
      perPersonCost: 3067,
      hotelCost: 14800,
      transportCost: 9200,
      guideCost: 3600,
      ticketCost: 5400,
      otherCost: 3800,
    } satisfies IEstimateResult);

  const historyMetrics: IHistoryMetric[] = [
    {
      label: '最近总价',
      value: formatCurrency(latestEstimate.totalCost),
    },
    {
      label: '人均参考',
      value: formatCurrency(latestEstimate.perPersonCost),
    },
    {
      label: '住宿占比',
      value: `${Math.round(((latestEstimate.hotelCost ?? 0) / Math.max(latestEstimate.totalCost, 1)) * 100)}%`,
    },
  ];

  const costBreakdown = [
    { label: '住宿', value: latestEstimate.hotelCost ?? 0 },
    { label: '交通', value: latestEstimate.transportCost ?? 0 },
    { label: '导游', value: latestEstimate.guideCost ?? 0 },
    { label: '门票', value: latestEstimate.ticketCost ?? 0 },
    { label: '其他', value: latestEstimate.otherCost ?? 0 },
  ].filter((item) => item.value > 0);

  return (
    <>
      <style jsx>{`
        .profile-page {
          animation: profileFadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes profileFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="profile-page w-full space-y-5">
        <section className="w-full">
          <Card className="overflow-hidden rounded-2xl border-border bg-card text-card-foreground shadow-[0_18px_40px_rgba(90,20,20,0.12)]">
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[hsl(3_68%_40%)] to-[hsl(9_54%_22%)] px-5 py-5 text-primary-foreground">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <Avatar className="size-16 shrink-0 rounded-2xl border border-white/20 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback className="rounded-2xl bg-white/16 text-base font-semibold text-white">
                      {getInitials(profileData.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                          {profileData.name}
                        </h1>
                        <Badge className="rounded-full border border-white/15 bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/12">
                          B端客户
                        </Badge>
                      </div>
                      <p className="text-sm text-white/85">
                        {profileData.role || '商务负责人'}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-white/88">
                      <div className="flex min-w-0 items-center gap-2">
                        <Building2Icon className="size-4 shrink-0 text-white/82" />
                        <span className="truncate">{profileData.company || '中国入境游合作机构'}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <PhoneCallIcon className="size-4 shrink-0 text-white/82" />
                        <span className="truncate">{profileData.phone || '400-820-1688'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">常用服务</p>
              <p className="text-xs leading-5 text-muted-foreground">高频账户入口与商务协同服务</p>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              常用 4 项
            </span>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            {serviceShortcuts.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="rounded-2xl border-border bg-card text-card-foreground shadow-[0_10px_30px_rgba(120,32,24,0.08)] transition-transform duration-200 active:scale-[0.98]"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${item.accentClassName}`}>
                        <Icon className="size-5" />
                      </div>
                      <ChevronRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs leading-5 text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="w-full space-y-3">
          <div>
            <p className="text-lg font-semibold text-foreground">历史测算摘要</p>
            <p className="text-xs leading-5 text-muted-foreground">最近一次方案测算结果可作为沟通参考</p>
          </div>

          <Card className="rounded-2xl border-border bg-card text-card-foreground shadow-[0_10px_30px_rgba(120,32,24,0.08)]">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-4 rounded-2xl bg-[linear-gradient(135deg,hsla(6,65%,95%,0.92),hsla(28,45%,97%,0.98))] p-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">最近一次报价方案</p>
                  <p className="text-3xl font-black tracking-tight text-primary">
                    {formatCurrency(latestEstimate.totalCost)}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    含住宿、交通、导游与门票的基础测算口径
                  </p>
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(160,30,30,0.16)]">
                  <SparklesIcon className="size-5" />
                </div>
              </div>

              <div className="grid w-full grid-cols-3 gap-3">
                {historyMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="min-w-0 rounded-xl border border-border bg-background px-3 py-3"
                  >
                    <p className="text-[11px] leading-5 text-muted-foreground">{item.label}</p>
                    <p className="truncate text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">费用构成</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3Icon className="size-3.5" />
                    <span>最近更新</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {costBreakdown.length > 0 ? (
                    costBreakdown.map((item) => {
                      const percentage = Math.max(
                        8,
                        Math.round((item.value / Math.max(latestEstimate.totalCost, 1)) * 100),
                      );

                      return (
                        <div key={item.label} className="space-y-2 rounded-xl bg-secondary px-3 py-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-foreground">{item.label}</span>
                            <span className="font-semibold text-foreground">{formatCurrency(item.value)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[hsl(24_18%_90%)]">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl bg-secondary px-4 py-4 text-sm text-muted-foreground">
                      暂无历史测算数据
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="w-full space-y-3">
          <div>
            <p className="text-lg font-semibold text-foreground">商务支持</p>
            <p className="text-xs leading-5 text-muted-foreground">专属顾问对接、报价跟进与落地协同支持</p>
          </div>

          <Card className="overflow-hidden rounded-2xl border-border bg-card text-card-foreground shadow-[0_10px_30px_rgba(120,32,24,0.08)]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(160,30,30,0.18)]">
                  <UserCircle2Icon className="size-7" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">王顾问</p>
                    <Badge className="rounded-full bg-[hsl(145_45%_94%)] text-[var(--success)] hover:bg-[hsl(145_45%_94%)]">
                      在线支持
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">入境游商务顾问 · 华北区域</p>
                  <p className="text-sm leading-6 text-foreground/90">
                    提供方案报价复核、产品组合建议与渠道合作推进支持。
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-[11px] leading-5 text-muted-foreground">联系电话</p>
                  <p className="text-sm font-semibold text-foreground">400-820-1688</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-[11px] leading-5 text-muted-foreground">服务时段</p>
                  <p className="text-sm font-semibold text-foreground">09:00 - 21:00</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[linear-gradient(135deg,hsla(2,72%,42%,0.08),hsla(6,65%,95%,0.9))] p-4">
                <p className="text-sm font-semibold text-foreground">适用支持范围</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  团队接待方案、酒店资源建议、交通配置、报价优化与客户提案支持。
                </p>
              </div>

              <div className="flex gap-3">
                <Button className="h-11 flex-1 rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(160,30,30,0.18)] hover:bg-[hsl(2_72%_38%)]">
                  立即联系
                </Button>
                <Button
                  variant="outline"
                  className="h-11 flex-1 rounded-xl border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  查看支持说明
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default ProfilePage;
