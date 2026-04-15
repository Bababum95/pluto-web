import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Toggle } from "./toggle"

describe("Toggle", () => {
  it("renders as a button", () => {
    render(<Toggle aria-label="Toggle option">Option</Toggle>)

    expect(screen.getByRole("button", { name: "Toggle option" })).toBeInTheDocument()
  })

  it("applies data-slot attribute", () => {
    render(<Toggle aria-label="Toggle option">Option</Toggle>)

    expect(screen.getByRole("button", { name: "Toggle option" })).toHaveAttribute(
      "data-slot",
      "toggle"
    )
  })

  it("supports pressed state", () => {
    render(
      <Toggle aria-label="Toggle option" pressed>
        Option
      </Toggle>
    )

    expect(screen.getByRole("button", { name: "Toggle option" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })

  it("handles click events", async () => {
    const onPressedChange = vi.fn()
    const user = userEvent.setup()

    render(
      <Toggle aria-label="Toggle option" onPressedChange={onPressedChange}>
        Option
      </Toggle>
    )

    await user.click(screen.getByRole("button", { name: "Toggle option" }))

    expect(onPressedChange).toHaveBeenCalledOnce()
  })

  it("supports disabled state", () => {
    render(
      <Toggle aria-label="Toggle option" disabled>
        Option
      </Toggle>
    )

    expect(screen.getByRole("button", { name: "Toggle option" })).toBeDisabled()
  })
})
