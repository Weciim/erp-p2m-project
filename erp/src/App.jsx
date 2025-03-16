import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';

const MainApp = lazy(() => import('@/apps/MainApp'));

export default function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Suspense fallback={<PageLoader />}>
          <MainApp />
        </Suspense>
      </Provider>
    </BrowserRouter>
  );
}
