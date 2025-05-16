import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";

import "./Layout.css";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <Header />
      <div className="page">
        {props.children}
        <Footer />
      </div>
    </div>
  );
}
