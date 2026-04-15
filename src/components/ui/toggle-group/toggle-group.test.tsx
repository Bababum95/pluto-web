import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ToggleGroup, ToggleGroupItem } from "./toggle-group"

describe("ToggleGroup", () => {
  const renderGroup = (props?: React.ComponentProps<typeof ToggleGroup>) =>
    render(
      <ToggleGroup type="single" defaultValue="income" {...props}>
        <ToggleGroupItem value="income">Income</ToggleGroupItem>
        <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
      </ToggleGroup>
    )

  it("renders toggle group root", () => {
    renderGroup()

    expect(screen.getByRole("group")).toBeInTheDocument()
  })

  it("renders toggle group items", () => {
    renderGroup()

    expect(screen.getByRole("radio", { name: "Income" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Expense" })).toBeInTheDocument()
  })

  it("applies data-slot attributes", () => {
    renderGroup()

    expect(screen.getByRole("group")).toHaveAttribute("data-slot", "toggle-group")
    expect(screen.getByRole("radio", { name: "Income" })).toHaveAttribute(
      "data-slot",
      "toggle-group-item"
    )
  })

  it("supports controlled value changes", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()

    render(
      <ToggleGroup type="single" value="income" onValueChange={onValueChange}>
        <ToggleGroupItem value="income">Income</ToggleGroupItem>
        <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
      </ToggleGroup>
    )

    await user.click(screen.getByRole("radio", { name: "Expense" }))

    expect(onValueChange).toHaveBeenCalledWith("expense")
  })

  it("inherits variant and size from group", () => {
    renderGroup({ variant: "outline", size: "sm" })

    const item = screen.getByRole("radio", { name: "Income" })
    expect(item).toHaveAttribute("data-variant", "outline")
    expect(item).toHaveAttribute("data-size", "sm")
  })
})
