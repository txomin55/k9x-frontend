import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import Calendar from "@lib/components/molecules/calendar/Calendar";

const utc = (value: string) => new Date(`${value}T00:00:00Z`).getTime();

describe("Calendar", () => {
  test("renders every day of the visible month", () => {
    const { getAllByText } = render(() => (
      <Calendar
        range={{ from: utc("2026-09-08"), to: utc("2026-09-20") }}
        locale="en-GB"
      />
    ));

    expect(getAllByText("1").length).toBeGreaterThan(0);
    expect(getAllByText("30").length).toBeGreaterThan(0);
  });

  test("hides the month selector when the range fits in one month", () => {
    const { queryByRole } = render(() => (
      <Calendar
        range={{ from: utc("2026-09-08"), to: utc("2026-09-20") }}
        locale="en-GB"
      />
    ));

    expect(
      queryByRole("button", { name: "Next month" }),
    ).not.toBeInTheDocument();
  });

  test("navigates between the months covered by the range", async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = render(() => (
      <Calendar
        range={{ from: utc("2026-09-08"), to: utc("2026-11-06") }}
        locale="en-GB"
      />
    ));

    expect(getByText("September 2026")).toBeInTheDocument();
    expect(getByRole("button", { name: "Previous month" })).toBeDisabled();

    await user.click(getByRole("button", { name: "Next month" }));
    expect(getByText("October 2026")).toBeInTheDocument();

    await user.click(getByRole("button", { name: "Next month" }));
    expect(getByText("November 2026")).toBeInTheDocument();
    expect(getByRole("button", { name: "Next month" })).toBeDisabled();
  });

  test("marks the range boundaries and the days inside it", () => {
    const { container } = render(() => (
      <Calendar
        range={{ from: utc("2026-09-08"), to: utc("2026-09-10") }}
        locale="en-GB"
      />
    ));

    expect(container.querySelectorAll(".calendar__day--in-range")).toHaveLength(
      3,
    );
    expect(
      container.querySelector(".calendar__day--start")?.textContent,
    ).toContain("8");
    expect(
      container.querySelector(".calendar__day--end")?.textContent,
    ).toContain("10");
  });

  test("calls onDayClick with the clicked day", async () => {
    const user = userEvent.setup();
    const onDayClick = vi.fn();
    const { getByRole } = render(() => (
      <Calendar
        range={{ from: utc("2026-09-08"), to: utc("2026-09-20") }}
        locale="en-GB"
        onDayClick={onDayClick}
      />
    ));

    await user.click(getByRole("button", { name: "9 September 2026" }));

    expect(onDayClick).toHaveBeenCalledWith(utc("2026-09-09"));
  });

  test("renders extra content per day", () => {
    const { getAllByText } = render(() => (
      <Calendar
        range={{ from: utc("2026-09-08"), to: utc("2026-09-20") }}
        locale="en-GB"
        dayContent={(day) =>
          day === utc("2026-09-09") ? <span>•</span> : undefined
        }
      />
    ));

    expect(getAllByText("•")).toHaveLength(1);
  });
});
