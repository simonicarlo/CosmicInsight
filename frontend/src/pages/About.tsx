import "./About.css";

const About = () => {
  return (
    <div className="view about-view">
      <div className="about">
        <h1>About Cosmic Insight</h1>
        <div className="about-content">
          <p>
            Welcome to Cosmic Insight, an interactive journey through our solar
            system. Our website offers a 3D visualization of the solar system,
            allowing users to explore the planets in a dynamic and immersive
            way.
          </p>
          <p>
            Simply click on a planet to uncover fascinating facts, scientific
            data, and insights. The data fueling Cosmic Insight is sourced from
            trusted providers such as NASA's APIs and Le Système Solaire,
            ensuring accurate and up-to-date information. For those who love to
            gaze at the wonders of space, our platform also provides access to a
            curated collection of stunning images from NASA's extensive image
            database.
          </p>
          <p>
            Cosmic Insight was developed as the final project for the course
            Fundamentals of Web Engineering at ETH Zürich. Through this project,
            we aimed to combine cutting-edge web technologies with our passion
            for space exploration, creating a platform that's both educational
            and engaging.
          </p>
          <p>We hope you enjoy exploring the cosmos with us!</p>
        </div>
      </div>
    </div>
  );
};

export default About;
