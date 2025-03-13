import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";

describe("Footer Component", () => {
  it("renders the correct year and text", () => {
    const currentYear = new Date().getFullYear();
    
    render(<Footer />);

    expect(screen.getByText(`© ${currentYear} NewFizzBuzz. All rights reserved.`)).toBeInTheDocument();
  });
});
