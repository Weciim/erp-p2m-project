import { lazy } from "react";

import { Navigate } from "react-router-dom";

const NotFound = lazy(() => import("@/pages/NotFound.jsx"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Invoice = lazy(() => import("@/pages/Invoice"));
const InvoiceCreate = lazy(() => import("@/pages/Invoice/InvoiceCreate"));
const Logout = lazy(() => import("@/pages/Logout.jsx"));
const InvoiceRead = lazy(() => import("@/pages/Invoice/InvoiceRead"));
const InvoiceUpdate = lazy(() => import("@/pages/Invoice/InvoiceUpdate"));
const InvoiceRecordPayment = lazy(
  () => import("@/pages/Invoice/InvoiceRecordPayment")
);
const Customer = lazy(() => import("@/pages/Customer"));
const Payment = lazy(() => import("@/pages/Payment/index"));
const PaymentRead = lazy(() => import("@/pages/Payment/PaymentRead"));
const PaymentUpdate = lazy(() => import("@/pages/Payment/PaymentUpdate"));
const Quote = lazy(() => import("@/pages/Quote/index"));
const QuoteCreate = lazy(() => import("@/pages/Quote/QuoteCreate"));
const QuoteRead = lazy(() => import("@/pages/Quote/QuoteRead"));
const QuoteUpdate = lazy(() => import("@/pages/Quote/QuoteUpdate"));
const PaymentMode = lazy(() => import("@/pages/PaymentMode"));
const Taxes = lazy(() => import("@/pages/Taxes"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings/Settings"));
const Purchase = lazy(() => import("@/pages/Purchase"));
const PurchaseCreate = lazy(() => import("@/pages/Purchase/PurchaseCreate"));
const PurchaseRead = lazy(() => import("@/pages/Purchase/PurchaseRead"));

let routes = {
  expense: [],
  default: [
    {
      path: "/login",
      element: <Navigate to="/" />,
    },
    {
      path: "/logout",
      element: <Logout />,
    },
    {},
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/customer",
      element: <Customer />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: "/invoice",
      element: <Invoice />,
    },
    {
      path: "/invoice/create",
      element: <InvoiceCreate />,
    },
    {
      path: "/invoice/read/:id",
      element: <InvoiceRead />,
    },
    {
      path: "/invoice/update/:id",
      element: <InvoiceUpdate />,
    },
    {
      path: "/invoice/pay/:id",
      element: <InvoiceRecordPayment />,
    },
    {
      path: "/payment",
      element: <Payment />,
    },
    {
      path: "/payment/read/:id",
      element: <PaymentRead />,
    },
    {
      path: "/payment/update/:id",
      element: <PaymentUpdate />,
    },
    {
      path: "/quote",
      element: <Quote />,
    },
    {
      path: "/quote/create",
      element: <QuoteCreate />,
    },
    {
      path: "/quote/read/:id",
      element: <QuoteRead />,
    },
    {
      path: "/quote/update/:id",
      element: <QuoteUpdate />,
    },
    {
      path: "/payment/mode",
      element: <PaymentMode />,
    },
    {
      path: "/taxes",
      element: <Taxes />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/settings",
      element: <Settings />,
    },
    {
      path: "/settings/edit/:settingsKey",
      element: <Settings />,
    },
    {
      path: "/purchase",
      element: <Purchase />,
    },
    {
      path: "/purchase/create",
      element: <PurchaseCreate />,
    },
    {
      path: "/purchase/read/:id",
      element: <PurchaseRead />,
    },
    // {
    //   path: "/purchase/update/:id",
    //   element: <PurchaseUpdate />,
    // },
  
  ],
};

export default routes;
