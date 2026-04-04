import { render, screen } from "@testing-library/react";

describe("frontend smoke", () => {
  it("renders a simple element", () => {
    render(<div>smoke-ok</div>);
    expect(screen.getByText("smoke-ok")).toBeInTheDocument();
  });
});
