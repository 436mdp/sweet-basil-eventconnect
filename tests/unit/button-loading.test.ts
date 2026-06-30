import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button loading state", () => {
  it("shows busy state and disables the button while loading", () => {
    render(React.createElement(Button, { loading: true }, "Join Event"));

    const button = screen.getByRole("button", { name: /join event/i });

    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(true);
  });
});
