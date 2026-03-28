import { describe, expect, it } from "vitest";
import { calculateFinancialGovernanceSnapshot } from "./financial-advisor";

describe("financial advisor governance snapshot", () => {
  it("calculates safe spending and reserve recommendations for a healthy month", () => {
    const snapshot = calculateFinancialGovernanceSnapshot({
      generatedAt: "2026-03-27",
      referenceDate: "2026-03-27",
      month: 3,
      year: 2026,
      settings: {
        taxPercent: "6",
        tithePercent: "10",
        investmentPercent: "10",
        proLaboreGross: "12000",
        companyReserveMonths: 3,
        personalReserveMonths: 6,
        companyMinCashMonths: "1",
        personalMinCashMonths: "1",
      },
      company: {
        summary: {
          current: {
            grossRevenue: 60000,
            netRevenue: 56400,
            taxAmount: 3600,
            fixedCosts: 8000,
            variableCosts: 6000,
            employeeCosts: 9000,
            purchases: 2000,
            reserve: 15000,
          },
        },
      },
      personal: {
        fixedCosts: { total: "4000" },
        variableCosts: { total: "1200" },
        debts: { totalMonthly: "800" },
        reserve: { total: "9000" },
      },
      calendarItems: [
        {
          day: 29,
          description: "[PES] Cartao",
          amount: "1200",
          type: "pessoal-fixo",
          status: "pendente",
        },
      ],
      debts: [],
      investments: [],
      reserveFunds: [],
      asaasCharges: [
        { status: "PENDING", dueDate: "2026-03-30" },
      ],
    });

    expect(snapshot.cashRiskLevel).toBe("healthy");
    expect(snapshot.safeToSpendMonth).toBeGreaterThan(0);
    expect(snapshot.safeToSpendNow).toBeGreaterThan(0);
    expect(snapshot.companyReserveRecommendation).toBeGreaterThan(0);
    expect(snapshot.personalReserveRecommendation).toBeGreaterThan(0);
    expect(snapshot.taxProvision).toBe(3600);
  });

  it("marks the month as critical when there are overdue items and no safe spending left", () => {
    const snapshot = calculateFinancialGovernanceSnapshot({
      generatedAt: "2026-03-27",
      referenceDate: "2026-03-27",
      month: 3,
      year: 2026,
      settings: {
        taxPercent: "6",
        tithePercent: "10",
        investmentPercent: "10",
        proLaboreGross: "8000",
        companyReserveMonths: 3,
        personalReserveMonths: 6,
        companyMinCashMonths: "1",
        personalMinCashMonths: "1",
      },
      company: {
        summary: {
          current: {
            grossRevenue: 15000,
            netRevenue: 14100,
            taxAmount: 900,
            fixedCosts: 7000,
            variableCosts: 5000,
            employeeCosts: 4000,
            purchases: 2000,
            reserve: 1000,
          },
        },
      },
      personal: {
        fixedCosts: { total: "3500" },
        variableCosts: { total: "2200" },
        debts: { totalMonthly: "1800" },
        reserve: { total: "500" },
      },
      calendarItems: [
        {
          day: 10,
          description: "[EMP] Imposto atrasado",
          amount: "1800",
          type: "empresa-fixo",
          status: "atrasada",
        },
      ],
      debts: [],
      investments: [],
      reserveFunds: [],
      asaasCharges: [
        { status: "OVERDUE", dueDate: "2026-03-12" },
      ],
    });

    expect(snapshot.cashRiskLevel).toBe("critical");
    expect(snapshot.safeToSpendMonth).toBe(0);
    expect(snapshot.counts.overdueItems).toBeGreaterThan(0);
    expect(snapshot.counts.overdueCharges).toBeGreaterThan(0);
    expect(snapshot.paymentPriority[0]?.urgency).toBe("overdue");
  });
});
