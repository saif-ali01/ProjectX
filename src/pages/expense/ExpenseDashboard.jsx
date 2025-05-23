import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { generateOverTime } from "../../utils/generateOverTime";
import { generateFinancialSummaryData } from "../../utils/generateFinancialSummaryData";
import AddExpenseForm from "../../components/expense-dashboard/AddExpenseForm";
import CategoryModal from "../../components/expense-dashboard/CategoryModal";
import EditExpenseModal from "../../components/expense-dashboard/EditExpenseModal";
import ExpenseOverTimeChart from "../../components/expense-dashboard/ExpenseOverTimeChart";
import ExpenseByCategoryChart from "../../components/expense-dashboard/ExpenseByCategoryChart";
import FinancialSummaryPieChart from "../../components/expense-dashboard/FinancialSummaryPieChart";
import FinancialSummaryLineChart from "../../components/expense-dashboard/FinancialSummaryLineChart";
import SummaryCards from "../../components/expense-dashboard/SummaryCards";
import TransactionsTable from "../../components/expense-dashboard/TransactionsTable";
import UndoDeleteToast from "../../components/expense-dashboard/UndoDeleteToast";
import DateRangePicker from "../../components/expense-dashboard/DateRangePicker";
import Toast from "../../components/common/Toast";

const ExpenseDashboard = ({ darkMode }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [overTime, setOverTime] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    timeSeries: [],
    pieData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [startDate, setStartDate] = useState(new Date("2023-09-01"));
  const [endDate, setEndDate] = useState(new Date());
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deletedTransaction, setDeletedTransaction] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const transactionsPerPage = 5;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterType]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [transactionsRes, earningsRes, categoriesRes] = await Promise.all([
          api.get("/api/expenses/transactions", {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            withCredentials: true,
          }),
          api.get("/api/earnings", {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            withCredentials: true,
          }),
          api.get("/api/expenses/categories", {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            withCredentials: true,
          }),
        ]);

        const transactionsData = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
        // Fix: Validate earnings response structure
        const earningsData = earningsRes.data.success && Array.isArray(earningsRes.data.data) ? earningsRes.data.data : [];
        const categoryData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

        setAllTransactions(transactionsData);
        setEarnings(earningsData);
        setCategories(categoryData);

        // Calculate summary
        const totalPersonal = transactionsData
          .filter((tx) => tx.type === "Personal")
          .reduce((sum, tx) => sum + tx.amount, 0);
        const totalProfessional = transactionsData
          .filter((tx) => tx.type === "Professional")
          .reduce((sum, tx) => sum + tx.amount, 0);
        const totalEarnings = earningsData.reduce((sum, e) => sum + e.amount, 0);
        // Dynamic budget: 80% of total earnings
        const budgetPercentage = 0.8; // 80% of earnings
        const totalBudget = totalEarnings * budgetPercentage;
        const budgetUsed = totalBudget > 0 ? ((totalPersonal + totalProfessional) / totalBudget) * 100 : 0;
        const categoryTotals = transactionsData.reduce((acc, tx) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
          return acc;
        }, {});
        const highestCategory = Object.entries(categoryTotals).reduce(
          (max, [category, total]) =>
            total > max.total ? { category, total } : max,
          { category: "None", total: 0 }
        );

        setSummary([
          {
            title: "Total Personal",
            value: `₹${totalPersonal.toLocaleString("en-IN")}`,
            icon: "💰",
          },
          {
            title: "Total Professional",
            value: `₹${totalProfessional.toLocaleString("en-IN")}`,
            icon: "📊",
          },
          {
            title: "Total Earnings",
            value: `₹${totalEarnings.toLocaleString("en-IN")}`,
            icon: "💸",
          },
          {
            title: "Budget Used",
            value: `${budgetUsed.toFixed(0)}%`,
            icon: "📈",
            tooltip: `Based on ${budgetPercentage * 100}% of total earnings (₹${totalBudget.toLocaleString("en-IN")})`,
          },
          {
            title: "Highest Category",
            value: highestCategory.category,
            icon: "🧭",
          },
        ]);

        setOverTime(generateOverTime(timeFrame, startDate, endDate, transactionsData));
        setFinancialSummary(
          generateFinancialSummaryData(
            timeFrame,
            startDate,
            endDate,
            transactionsData,
            earningsData
          )
        );
      } catch (err) {
        console.error("Fetch error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        const errorMessage = err.response?.data?.message || "Failed to load data";
        setError(errorMessage);
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, timeFrame]);

  // Filter and paginate transactions
  useEffect(() => {
    let filteredTransactions = allTransactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate >= startDate &&
        txDate <= endDate &&
        (!filterCategory || tx.category === filterCategory) &&
        (!filterType || tx.type === filterType) &&
        (!searchQuery ||
          tx.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    setTotalPages(totalPages);

    filteredTransactions = filteredTransactions.sort((a, b) => {
      const multiplier = sortOrder === "desc" ? -1 : 1;
      if (sortBy === "date")
        return multiplier * (new Date(b.date) - new Date(a.date));
      if (sortBy === "amount") return multiplier * (b.amount - a.amount);
      return multiplier * a[sortBy].localeCompare(b[sortBy]);
    });

    const startIndex = (currentPage - 1) * transactionsPerPage;
    const paginatedTransactions = filteredTransactions.slice(
      startIndex,
      startIndex + transactionsPerPage
    );

    const formattedTransactions = paginatedTransactions.map((tx) => ({
      ...tx,
      date: new Date(tx.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      amount: `₹${tx.amount.toLocaleString("en-IN")}`,
    }));

    setTransactions(formattedTransactions);
  }, [
    allTransactions,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    filterCategory,
    filterType,
    searchQuery,
    currentPage,
    // Fix: Removed transactionsPerPage from dependencies as it's a constant
  ]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleAddExpense = async (formData) => {
    try {
      const amount = parseFloat(formData.amount);
      const date = formData.date ? new Date(formData.date) : null;
      if (
        !date ||
        isNaN(date) ||
        !formData.description ||
        isNaN(amount) ||
        amount <= 0 ||
        !formData.category ||
        !formData.type
      ) {
        setToast({ message: "Please fill all fields with valid data", type: "error" });
        return;
      }
      const newTx = {
        description: formData.description,
        category: formData.category,
        amount: amount,
        date: date.toISOString(),
        type: formData.type,
      };
      const response = await api.post("/api/expenses", newTx, { withCredentials: true });
      setAllTransactions((prev) => [...prev, response.data]);
      setAddModalOpen(false);
      setCurrentPage(1);
      setToast({ message: "Expense added successfully", type: "success" });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add expense";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(selectedTransaction.amount);
      if (
        !selectedTransaction.date ||
        !selectedTransaction.description ||
        isNaN(amount) ||
        amount <= 0
      ) {
        setToast({ message: "Please fill all fields with valid data", type: "error" });
        return;
      }
      const updatedTx = {
        date: selectedTransaction.date,
        description: selectedTransaction.description,
        category: selectedTransaction.category,
        amount: amount,
        type: selectedTransaction.type,
      };
      const response = await api.put(`/api/expenses/${selectedTransaction.id}`, updatedTx, {
        withCredentials: true,
      });
      setAllTransactions((prev) =>
        prev.map((tx) => (tx.id === selectedTransaction.id ? response.data : tx))
      );
      setEditModalOpen(false);
      setSelectedTransaction(null);
      setCurrentPage(1);
      setToast({ message: "Expense updated successfully", type: "success" });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update expense";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await api.delete(`/api/expenses/${selectedTransaction.id}`, { withCredentials: true });
      setDeletedTransaction(selectedTransaction);
      setAllTransactions((prev) =>
        prev.filter((tx) => tx.id !== selectedTransaction.id)
      );
      setShowUndo(true);
      setEditModalOpen(false);
      setSelectedTransaction(null);
      setCurrentPage(1);
      setToast({ message: "Expense deleted successfully", type: "success" });
      setTimeout(() => setShowUndo(false), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete expense";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handleUndoDelete = async () => {
    try {
      if (deletedTransaction) {
        const response = await api.post("/api/expenses", deletedTransaction, {
          withCredentials: true,
        });
        setAllTransactions((prev) => [...prev, response.data]);
        setDeletedTransaction(null);
        setShowUndo(false);
        setCurrentPage(1);
        setToast({ message: "Expense restored successfully", type: "success" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to undo delete";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handlePieClick = (data) => {
    setSelectedCategory(data.name);
    setModalOpen(true);
  };

  const handleTransactionClick = (tx) => {
    setSelectedTransaction({
      ...tx,
      date: tx.date,
      // Fix: Add validation for amount parsing
      amount: typeof tx.amount === "string" ? parseFloat(tx.amount.replace("₹", "").replace(/,/g, "")) || 0 : 0,
    });
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <div
        className={`max-w-7xl mx-auto min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div
          className={`p-4 rounded-lg flex items-center ${
            darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"
          }`}
        >
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`max-w-7xl mx-auto p-0 min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div
          className={`p-6 rounded-lg shadow-md ${
            darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
          }`}
        >
          <h2 className="text-lg font-semibold mb-3">Error Loading Dashboard</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 ${
              darkMode
                ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Back to Bills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-7xl mx-auto p-1 min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <header
        className={`p-6 rounded-t-lg shadow-lg flex justify-between items-center text-white ${
          darkMode
            ? "bg-gradient-to-r from-blue-600 to-indigo-700"
            : "bg-gradient-to-r from-blue-500 to-indigo-600"
        }`}
      >
        <h1 className="text-2xl font-bold tracking-tight">Star Printing - Expense Dashboard</h1>
      </header>

      <main className="mt-6">
        <div
          className={`rounded-lg shadow-md p-6 mb-6 border transition-colors duration-300 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <DateRangePicker
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            setAddModalOpen={setAddModalOpen}
            darkMode={darkMode}
          />
        </div>

        <div
          className={`rounded-lg shadow-md p-6 mb-6 border transition-colors duration-300 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <SummaryCards summary={summary} darkMode={darkMode} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 animate-fade-in">
          <div
            className={`rounded-lg shadow-md p-6 border transition-colors duration-300 ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <ExpenseOverTimeChart
              overTime={overTime}
              timeFrame={timeFrame}
              darkMode={darkMode}
            />
          </div>
          <div
            className={`rounded-lg shadow-md p-6 border transition-colors duration-300 ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <ExpenseByCategoryChart
              categories={categories}
              darkMode={darkMode}
              onPieClick={handlePieClick}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 animate-fade-in">
          <div
            className={`rounded-lg shadow-md p-6 border transition-colors duration-300 ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <FinancialSummaryPieChart
              financialSummary={financialSummary}
              darkMode={darkMode}
            />
          </div>
          <div
            // Fix: Corrected className syntax
            className={`rounded-lg shadow-md p-6 border transition-colors duration-300 ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <FinancialSummaryLineChart
              financialSummary={financialSummary}
              timeFrame={timeFrame}
              darkMode={darkMode}
            />
          </div>
        </div>

        <div
          className={`rounded-lg shadow-md p-6 border transition-colors duration-300 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <TransactionsTable
            transactions={transactions}
            categories={categories}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterType={filterType}
            setFilterType={setFilterType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            handleTransactionClick={handleTransactionClick}
            darkMode={darkMode}
          />
        </div>

        <CategoryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedCategory={selectedCategory}
          categories={categories}
          darkMode={darkMode}
        />

        {addModalOpen && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-colors duration-300 ${
              darkMode ? "bg-opacity-75" : "bg-opacity-50"
            }`}
          >
            <AddExpenseForm
              onSubmit={handleAddExpense}
              onCancel={() => setAddModalOpen(false)}
              darkMode={darkMode}
            />
          </div>
        )}

        <EditExpenseModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          selectedTransaction={selectedTransaction}
          setSelectedTransaction={setSelectedTransaction}
          categories={categories}
          handleEditExpense={handleEditExpense}
          handleDeleteExpense={handleDeleteExpense}
          darkMode={darkMode}
        />

        <UndoDeleteToast
          showUndo={showUndo}
          handleUndoDelete={handleUndoDelete}
          darkMode={darkMode}
        />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            darkMode={darkMode}
          />
        )}
      </main>
    </div>
  );
};

export default ExpenseDashboard;