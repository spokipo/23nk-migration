import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import {ErrorPage} from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import CatalogPage from '@/components/pages/CatalogPage';
import ProductDetailPage from '@/components/pages/ProductDetailPage';
import ReviewsPage from '@/components/pages/ReviewsPage';
import ReviewDetailPage from '@/components/pages/ReviewDetailPage';
import DeliveryPage from '@/components/pages/DeliveryPage';
import ContactPage from '@/components/pages/ContactPage';
import PrivacyPolicyPage from '@/components/pages/PrivacyPolicyPage';
import TermsConditionsPage from '@/components/pages/TermsConditionsPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        handle: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "catalog",
        element: <CatalogPage />,
        handle: {
          pageIdentifier: 'catalog',
        },
      },
      {
        path: "collection/:id",
        element: <Navigate to="/catalog" replace />,
        handle: {
          pageIdentifier: 'collection',
        },
      },
      {
        path: "product/:id",
        element: <ProductDetailPage />,
        handle: {
          pageIdentifier: 'product-detail',
        },
      },
      {
        path: "reviews",
        element: <ReviewsPage />,
        handle: {
          pageIdentifier: 'reviews',
        },
      },
      {
        path: "review/:id",
        element: <ReviewDetailPage />,
        handle: {
          pageIdentifier: 'review-detail',
        },
      },
      {
        path: "delivery",
        element: <DeliveryPage />,
        handle: {
          pageIdentifier: 'delivery',
        },
      },
      {
        path: "contact",
        element: <ContactPage />,
        handle: {
          pageIdentifier: 'contact',
        },
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicyPage />,
        handle: {
          pageIdentifier: 'privacy-policy',
        },
      },
      {
        path: "terms-conditions",
        element: <TermsConditionsPage />,
        handle: {
          pageIdentifier: 'terms-conditions',
        },
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return <RouterProvider router={router} />;
}