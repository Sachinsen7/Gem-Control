import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import store from "./redux/store";
import { getTheme } from "./theme.js";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard.jsx";
import UserManagement from "./pages/UserManagement";
import FirmManagement from "./pages/FirmManagemenet";
import RatesManagement from "./pages/RatesManagement";
import CustomerManagement from "./pages/CustomerManagement";
import RawMaterials from "./pages/RawMaterials";
import Categories from "./pages/Categories";
import ItemsManagement from "./pages/ItemManagement";
import SalesManagement from "./pages/SalesManagement";
import PaymentManagement from "./pages/PaymentManagement";
import UdharManagement from "./pages/UdharManagement";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { ROUTES } from "./utils/routes";
import ErrorBoundary from "./ErrorBoundary.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </Provider>
  );
}

function MainApp() {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const theme = getTheme(darkMode ? "dark" : "light");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Signup />} />
          <Route
            element={
              <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ flexGrow: 1 }}>
                  <Navbar />
                  <main style={{ padding: "20px" }}>
                    <ProtectedRoute />
                  </main>
                </div>
              </div>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.USER_MANAGEMENT} element={<UserManagement />} />
            <Route path={ROUTES.FIRM_MANAGEMENT} element={<FirmManagement />} />
            <Route
              path={ROUTES.RATES_MANAGEMENT}
              element={<RatesManagement />}
            />
            <Route
              path={ROUTES.CUSTOMER_MANAGEMENT}
              element={<CustomerManagement />}
            />
            <Route path={ROUTES.RAW_MATERIALS} element={<RawMaterials />} />
            <Route path={ROUTES.CATEGORIES} element={<Categories />} />
            <Route
              path={ROUTES.ITEMS_MANAGEMENT}
              element={<ItemsManagement />}
            />
            <Route
              path={ROUTES.SALES_MANAGEMENT}
              element={<SalesManagement />}
            />
            <Route path={ROUTES.PAYMENTS} element={<PaymentManagement />} />
            <Route
              path={ROUTES.UDHAR_MANAGEMENT}
              element={<UdharManagement />}
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
