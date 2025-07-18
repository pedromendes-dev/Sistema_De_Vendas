import type { Sale, Attendant } from "@shared/schema";
import type { CommissionRule } from "@shared/commission-schema";

export interface CommissionCalculation {
  saleValue: number;
  commissionValue: number;
  rule: CommissionRule;
  breakdown: string;
}

export function calculateCommission(
  sale: Sale,
  attendant: Attendant,
  rules: CommissionRule[]
): CommissionCalculation | null {
  const saleValue = parseFloat(sale.value);
  
  // Find applicable rule
  const applicableRule = rules.find(rule => {
    if (rule.isActive !== 1) return false;
    
    if (rule.minTarget && rule.maxTarget) {
      const minTarget = parseFloat(rule.minTarget);
      const maxTarget = parseFloat(rule.maxTarget);
      return saleValue >= minTarget && saleValue <= maxTarget;
    }
    
    return true; // Default rule
  });
  
  if (!applicableRule) return null;
  
  let commissionValue = 0;
  let breakdown = "";
  
  switch (applicableRule.type) {
    case "percentage":
      commissionValue = saleValue * (parseFloat(applicableRule.baseValue) / 100);
      breakdown = `${applicableRule.baseValue}% de R$ ${saleValue.toFixed(2)}`;
      break;
      
    case "fixed":
      commissionValue = parseFloat(applicableRule.baseValue);
      breakdown = `Valor fixo de R$ ${commissionValue.toFixed(2)}`;
      break;
      
    case "tiered":
      // Base commission
      const baseCommission = saleValue * (parseFloat(applicableRule.baseValue) / 100);
      commissionValue = baseCommission;
      breakdown = `Base: ${applicableRule.baseValue}% = R$ ${baseCommission.toFixed(2)}`;
      
      // Check for bonus
      if (applicableRule.minTarget && saleValue >= parseFloat(applicableRule.minTarget)) {
        const bonus = saleValue * (parseFloat(applicableRule.bonusPercentage || "0") / 100);
        commissionValue += bonus;
        breakdown += ` + Bônus: ${applicableRule.bonusPercentage}% = R$ ${bonus.toFixed(2)}`;
      }
      break;
  }
  
  // Check monthly performance bonus
  const monthlyEarnings = parseFloat(attendant.earnings);
  if (monthlyEarnings > 10000) {
    const performanceBonus = commissionValue * 0.1; // 10% extra
    commissionValue += performanceBonus;
    breakdown += ` + Bônus performance: R$ ${performanceBonus.toFixed(2)}`;
  }
  
  return {
    saleValue,
    commissionValue,
    rule: applicableRule,
    breakdown
  };
}

export function calculatePeriodCommissions(
  sales: Sale[],
  attendants: Map<number, Attendant>,
  rules: CommissionRule[],
  startDate: Date,
  endDate: Date
): Map<number, { total: number; count: number; details: CommissionCalculation[] }> {
  const commissionsByAttendant = new Map<number, { total: number; count: number; details: CommissionCalculation[] }>();
  
  const periodSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= startDate && saleDate <= endDate;
  });
  
  periodSales.forEach(sale => {
    const attendant = attendants.get(sale.attendantId);
    if (!attendant) return;
    
    const calculation = calculateCommission(sale, attendant, rules);
    if (!calculation) return;
    
    const current = commissionsByAttendant.get(sale.attendantId) || { total: 0, count: 0, details: [] };
    current.total += calculation.commissionValue;
    current.count += 1;
    current.details.push(calculation);
    
    commissionsByAttendant.set(sale.attendantId, current);
  });
  
  return commissionsByAttendant;
}