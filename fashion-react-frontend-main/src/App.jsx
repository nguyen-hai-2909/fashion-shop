import { Fragment } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Routers from './routes/Routers';
import ScrollToTopOnRoute from "./components/ScrollToTopOnRoute";

const queryClient = new QueryClient();

function App() {
  
  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <ScrollToTopOnRoute />
        <Routers/>
      </QueryClientProvider>
    </Fragment>
  )
}

export default App
