import { NavLink } from "react-router-dom";

import { capitalize } from "../helpers/stringHelpers.ts";

import "./PlanetNavigation.css";

const planets = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

const PlanetNavigation = () => {
  return (
    <nav className="planet-navigation">
      <ul className="planet-list">
        {planets.map((planet) => (
          <NavLink
            key={planet}
            className="planet-link"
            to={`/planets/${planet}`}
          >
            <img
              className="planet-icon"
              src={`/planetImages/${planet}.png`}
              alt={planet}
            />
            <span>{capitalize(planet)}</span>
          </NavLink>
        ))}
      </ul>
    </nav>
  );
};

export default PlanetNavigation;
