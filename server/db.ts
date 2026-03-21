// Database module - re-exports all database functions from organized submodules
// This file serves as the main entry point for database operations

// Database connection and shared utilities
export { getDb } from './db/db';

// Users & Settings
export { upsertUser, getUserByOpenId } from './db/users';
export { getSettings, upsertSettings } from './db/settings';

// Revenues
export { getRevenues, createRevenue, updateRevenue, deleteRevenue } from './db/revenues';

// Company Costs
export {
  getCompanyFixedCosts, createCompanyFixedCost, updateCompanyFixedCost, deleteCompanyFixedCost,
  getCompanyVariableCosts, createCompanyVariableCost, updateCompanyVariableCost, deleteCompanyVariableCost,
} from './db/company-costs';

// Employees & Suppliers
export {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getSupplierPurchases, createSupplierPurchase, updateSupplierPurchase, deleteSupplierPurchase,
} from './db/employees-suppliers';

// Personal Costs
export {
  getPersonalFixedCosts, createPersonalFixedCost, updatePersonalFixedCost, deletePersonalFixedCost,
  getPersonalVariableCosts, createPersonalVariableCost, updatePersonalVariableCost, deletePersonalVariableCost,
} from './db/personal-costs';

// Debts & Investments
export {
  getDebts, createDebt, updateDebt, deleteDebt,
  getInvestments, createInvestment, updateInvestment, deleteInvestment,
  getReserveFunds, createReserveFund, deleteReserveFund,
} from './db/debts-investments';

// Clients & Services
export {
  getClients, createClient, updateClient, deleteClient,
  getServices, createService, updateService, deleteService,
} from './db/clients-services';

// Dashboard & Calendar
export {
  getCompanyDashboardData,
  getPersonalDashboardData,
  getCalendarData,
} from './db/dashboard';
