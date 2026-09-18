import { describe, expect, it } from "vitest";
import { nativeDestination } from "./native-routing";

describe("nativeDestination", () => {
  it("routes verified Party and Games links", () => {
    expect(
      nativeDestination("https://party.xmasgoat.com/events/party-1?tab=food"),
    ).toBe("https://app.xmasgoat.com/parties/party-1?tab=food");
    expect(
      nativeDestination("https://games.xmasgoat.com/join?code=ABC234"),
    ).toBe("https://app.xmasgoat.com/games/join?code=ABC234");
  });

  it("supports the unified and legacy app schemes", () => {
    expect(
      nativeDestination(
        "xmasgoat://open?url=https%3A%2F%2Fparty.xmasgoat.com%2Fevents%2Fparty-1",
      ),
    ).toBe("https://app.xmasgoat.com/parties/party-1");
    expect(
      nativeDestination(
        "gamegoat://open?target=%2Fkris-kringle%2Froom%2FABC234",
      ),
    ).toBe("https://app.xmasgoat.com/games/white-elephant/room/ABC234");
  });

  it("rejects untrusted and malformed destinations", () => {
    expect(
      nativeDestination(
        "xmasgoat://open?url=https%3A%2F%2Fevil.example%2Flogin",
      ),
    ).toBe("https://app.xmasgoat.com/");
    expect(
      nativeDestination("gamegoat://open?target=%2F%2Fevil.example"),
    ).toBeNull();
    expect(nativeDestination("not a url")).toBeNull();
  });
});
