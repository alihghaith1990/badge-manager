/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ed2126", // main red
          soft: "#fdebec",    // light tint for cards
        },
        secondary: {
          DEFAULT: "#002D74", // dark blue
          soft: "#e6edfb",    // optional light tint
        },
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(to right, #ed2126 0%, #ed2126 30%, #002D74 100%)",
      },
      borderColor: {
        primary: "#ed2126",
        secondary: "#002D74",
      },
      textColor: {
        primary: "#ed2126",
        secondary: "#002D74",
      }
    },
  },
  plugins: [],
};
