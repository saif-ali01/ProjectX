export const generateFinancialSummaryData = (
  timeFrame,
  startDate,
  endDate,
  transactions,
  earnings
) => {
  const data = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  if (timeFrame === "daily") {
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const dailyExpenses = transactions
        .filter((tx) => tx.date === dateStr)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const dailyEarnings = earnings
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      const dailyProfitLoss = dailyEarnings - dailyExpenses;
      data.push({
        date: dateStr,
        expenses: dailyExpenses,
        earnings: dailyEarnings,
        profitLoss: dailyProfitLoss,
      });
      current.setDate(current.getDate() + 1);
    }
  } else if (timeFrame === "monthly") {
    while (current <= end) {
      const monthStr = `${current.getFullYear()}-${String(
        current.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthlyExpenses = transactions
        .filter((tx) => tx.date.startsWith(monthStr))
        .reduce((sum, tx) => sum + tx.amount, 0);
      const monthlyEarnings = earnings
        .filter((e) => e.date.startsWith(monthStr))
        .reduce((sum, e) => sum + e.amount, 0);
      const monthlyProfitLoss = monthlyEarnings - monthlyExpenses;
      data.push({
        month: monthStr,
        expenses: monthlyExpenses,
        earnings: monthlyEarnings,
        profitLoss: monthlyProfitLoss,
      });
      current.setMonth(current.getMonth() + 1);
    }
  } else if (timeFrame === "yearly") {
    while (current <= end) {
      const yearStr = current.getFullYear().toString();
      const yearlyExpenses = transactions
        .filter((tx) => tx.date.startsWith(yearStr))
        .reduce((sum, tx) => sum + tx.amount, 0);
      const yearlyEarnings = earnings
        .filter((e) => e.date.startsWith(yearStr))
        .reduce((sum, e) => sum + e.amount, 0);
      const yearlyProfitLoss = yearlyEarnings - yearlyExpenses;
      data.push({
        year: yearStr,
        expenses: yearlyExpenses,
        earnings: yearlyEarnings,
        profitLoss: yearlyProfitLoss,
      });
      current.setFullYear(current.getFullYear() + 1);
    }
  }

  const totalExpenses = transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= endDate;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalEarnings = earnings
    .filter((e) => {
      const eDate = new Date(e.date);
      return eDate >= startDate && eDate <= endDate;
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const totalProfitLoss = totalEarnings - totalExpenses;

  return {
    timeSeries: data,
    pieData: [
      { name: "Expenses", value: totalExpenses },
      { name: "Earnings", value: totalEarnings },
      { name: "Profit/Loss", value: Math.abs(totalProfitLoss) },
    ],
  };
};
