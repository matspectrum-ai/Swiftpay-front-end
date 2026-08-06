"use server";

import client from "@/clients/client";
import type { ReadMerchantDashboardData, DashboardPeriod } from "@/types/merchant/dashboard";
import type { ApiResponse } from "@/types/common";
import type { AxiosError } from "axios";
import { ApprovalRateLevel } from "@/types/enums";

export interface DashboardFilters {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
}

// Gera dados de volume diário mockados para os últimos N dias
function generateMockDailyVolume(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const base = 18000 + Math.sin(i * 0.8) * 9000 + Math.random() * 5000;
    data.push({
      date: date.toISOString().split('T')[0],
      volume: Math.round(base),
      transactionCount: Math.round(base / 320),
    });
  }
  return data;
}

function generateMockWeeklyVolume() {
  return Array.from({ length: 8 }, (_, i) => ({
    weekNumber: i + 1,
    label: `S${i + 1}`,
    volume: Math.round(90000 + Math.sin(i * 1.2) * 40000 + Math.random() * 20000),
    transactionCount: Math.round(280 + i * 30 + Math.random() * 40),
  }));
}

const MOCK_DASHBOARD: ReadMerchantDashboardData = {
  kpis: {
    totalSales: 847,
    totalVolume: 284530.00,
    totalFees: 8535.90,
    totalNetVolume: 275994.10,
    totalPayouts: 198000.00,
    pendingPayouts: 31200.00,
    refundedAmount: 4210.50,
    refundedTransactions: 12,
    volumeToday: 18432.00,
    volumeThisWeek: 97840.00,
    volumeThisMonth: 284530.00,
    approvalRate: 94.7,
    approvalRateLevel: ApprovalRateLevel.Good,
    chargebackCount: 2,
    chargebackRate: 0.24,
    failedTransactions: 45,
    failedRate: 5.3,
    totalTransactions: 892,
    completedTransactions: 847,
    volumeGrowth: 12.4,
    transactionsGrowth: 8.1,
    approvalRateGrowth: 1.3,
    failedRateGrowth: -0.8,
    growthComparisonLabel: 'vs. período anterior',
  },
  balance: {
    currency: 'BRL',
    available: 31247.80,
    pending: 8940.20,
    reserved: 0,
    total: 40188.00,
  },
  volumeChart: generateMockDailyVolume(30),
  weeklyChart: generateMockWeeklyVolume(),
  cacheInfo: {
    lastUpdatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    nextUpdateAt: new Date(Date.now() + 12 * 60000).toISOString(),
    cacheDurationMinutes: 15,
    isProcessing: false,
  },
  periodInfo: {
    period: 'this_month',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Este mês',
  },
};

export async function getMerchantDashboard(
  merchantId: string,
  filters?: DashboardFilters
): Promise<ApiResponse<ReadMerchantDashboardData>> {
  // Modo auditoria: retorna dados mock para o merchant de preview
  if (merchantId === 'preview-merchant-id') {
    return { data: MOCK_DASHBOARD, message: null, error: null };
  }

  try {
    const response = await client.get<ApiResponse<ReadMerchantDashboardData>>(
      `/v1/merchant/${merchantId}/dashboard`,
      { params: filters }
    );
    if (!response?.data) {
      return { data: null, message: null, error: { message: "Resposta vazia do backend" } };
    }
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiResponse<ReadMerchantDashboardData>>;
    if (err.response?.data) return err.response.data;
    return { data: null, message: null, error: { message: "Erro ao buscar dashboard do merchant" } };
  }
}
