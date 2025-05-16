import React, { useEffect, useRef } from "react";
import "./Toolbar.css";

export default function Toolbar(props: {
  selectedPlanet: string;
  onSelection: (selection: string) => void;
}) {
  const { onSelection } = props;
  const dropdownRef = useRef(null); // Reference to the dropdown menu
  const [selectedTab, setSelectedTab] = React.useState("Overview");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false); // To toggle dropdown visibility

  let dropdown_tabs = [
    "Images",
    "Moons",
    "Orbit",
    "Temperature",
    "Gravity",
    "Axis Tilt",
    "Interior Composition",
    "Atmospheric Composition",
  ];

  if (props.selectedPlanet === "sun") {
    dropdown_tabs = ["Images"];
  }

  if (props.selectedPlanet === "pluto") {
    dropdown_tabs = [
      "Images",
      "Moons",
      "Orbit",
      "Temperature",
      "Gravity",
      "Axis Tilt",
    ];
  }

  const handleClick = (tab: string) => {
    setSelectedTab(tab);
    onSelection(tab);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Close dropdown if clicked outside
      }
    };

    // Add event listener on mount
    document.addEventListener("mousedown", handleOutsideClick);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="toolbar">
      {/* Overview button */}
      <button
        key="Overview"
        onClick={() => handleClick("Overview")}
        className={selectedTab === "Overview" ? "selected" : "unselected"}
        role="button"
        aria-pressed={selectedTab === "Overview" ? "true" : "false"}
      >
        Overview
      </button>

      {/* Dropdown button */}
      <div
        className={"dropdown " + (isDropdownOpen ? "show" : "hide")}
        ref={dropdownRef}
        role="presentation"
      >
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="dropdown-toggle"
          aria-expanded={isDropdownOpen ? "true" : "false"} // Indicates dropdown state
          aria-controls="dropdown-menu"
        >
          Options ▼
        </button>

        {/* When dropdown is open */}
        <div
          className="dropdown-menu"
          id="dropdown-menu"
          role="menu" // ARIA role for a menu
          aria-hidden={!isDropdownOpen} // Indicate dropdown visibility
        >
          {isDropdownOpen &&
            dropdown_tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleClick(tab)}
                className={selectedTab === tab ? "selected" : "unselected"}
                role="menuitem" // ARIA role for a menu item
                aria-selected={selectedTab === tab ? "true" : "false"} // Indicate selection
              >
                {tab}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
