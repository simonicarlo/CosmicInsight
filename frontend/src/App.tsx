import "./App.css";
import { useAppState, AppStateProvider } from "./contexts/appState.tsx";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

import Layout from "./Layout.tsx";
import Home from "./pages/Home.tsx";
import Planet from "./pages/Planet.tsx";
import Test from "./pages/Test.tsx";
import About from "./pages/About.tsx";
import ImageExplorer from "./pages/ImageExplorer.tsx";
import PageNotFound from "./pages/PageNotFound.tsx";

function App() {
  const { appState } = useAppState();

  return (
    <Router>
      <div className={appState.theme == "light" ? "app light" : "app dark"}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planets/:planet" element={<Planet />} />
            <Route path="/about" element={<About />} />
            <Route path="/images" element={<ImageExplorer />} />
            <Route path="/test" element={<Test />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
