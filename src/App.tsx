import React, { Suspense } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const HomePage = React.lazy(() => import("./pages/HomePage/HomePage"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
]);

function App() {
    return (
        <Suspense fallback={<>Loading...</>}>
            <RouterProvider router={router} />
        </Suspense>
    );
}

export default App;
