import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Zvukoviny",
  // Your website's title and description (meta fields)
  title:
    "Zvukoviny – pastva pro uši",
  description:
    "Get your new startup website up and running quickly with our beautiful website theme designed using Astro and Tailwind CSS. Perfect for freelancers, developers, startups, and personal use.",

  // Your information for blog post purposes
  author: {
    name: "Zvukoviny",
    email: "info@zvukoviny.cz",
    twitter: "-",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/zvukoviny-logo.jpg",
    alt: "Zvukoviny logo",
  },
};

export default siteData;
