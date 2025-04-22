export const generateOverTime = (timeFrame, startDate, endDate, transactions) => {
    const data = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
  
    if (timeFrame === "daily") {
      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        const dailyPersonal = transactions
          .filter((tx) => tx.date === dateStr && tx.type === "Personal")
          .reduce((sum, tx) => sum + tx.amount, 0);
        const dailyProfessional = transactions
          .filter((tx) => tx.date === dateStr && tx.type === "Professional")
          .reduce((sum, tx) => sum + tx.amount, 0);
        data.push({
          date: dateStr,
          personal: dailyPersonal,
          professional: dailyProfessional,
        });
        current.setDate(current.getDate() + 1);
      }
    } else if (timeFrame === "monthly") {
      while (current <= end) {
        const monthStr = `${current.getFullYear()}-${String(
          current.getMonth() + 1
        ).padStart(2, "0")}`;
        const monthlyPersonal = transactions
          .filter((tx) => tx.date.startsWith(monthStr) && tx.type === "Personal")
          .reduce((sum, tx) => sum + tx.amount, 0);
        const monthlyProfessional = transactions
          .filter(
            (tx) => tx.date.startsWith(monthStr) && tx.type === "Professional"
          )
          .reduce((sum, tx) => sum + tx.amount, 0);
        data.push({
          month: monthStr,
          personal: monthlyPersonal,
          professional: monthlyProfessional,
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else if (timeFrame === "yearly") {
      while (current <= end) {
        const yearStr = current.getFullYear().toString();
        const yearlyPersonal = transactions
          .filter((tx) => tx.date.startsWith(yearStr) && tx.type === "Personal")
          .reduce((sum, tx) => sum + tx.amount, 0);
        const yearlyProfessional = transactions
          .filter((tx) => tx.date.startsWith(yearStr) && tx.type === "Professional")
          .reduce((sum, tx) => sum + tx.amount, 0);
        data.push({
          year: yearStr,
          personal: yearlyPersonal,
          professional: yearlyProfessional,
        });
        current.setFullYear(current.getFullYear() + 1);
      }
    }
  
    return data;
  };
  
